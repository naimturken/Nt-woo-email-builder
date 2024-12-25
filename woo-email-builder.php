<?php
/*
Plugin Name: Nt WooCommerce Advanced Email Builder
Plugin URI: https://lezzetyurdu.com.tr
Description: WooCommerce e-postalarını özelleştirmenizi sağlayan gelişmiş bir e-posta oluşturucu.
Version: 2.0
Author: Naim Türken
Author URI: https://naimturken.com
*/

if (!defined('ABSPATH')) {
    exit;
}

class WC_Advanced_Email_Builder {
    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('wp_ajax_save_email_template', array($this, 'save_email_template'));
        add_action('wp_ajax_load_email_template', array($this, 'load_email_template'));
        add_action('wp_ajax_import_current_template', array($this, 'import_current_template'));
        add_action('wp_ajax_get_woocommerce_data', array($this, 'get_woocommerce_data'));
        add_filter('woocommerce_email_content_type', array($this, 'set_content_type'));
        add_filter('woocommerce_email_content', array($this, 'customize_email_content'), 10, 2);
    }

    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'Gelişmiş E-posta Oluşturucu',
            'Gelişmiş E-posta Oluşturucu',
            'manage_options',
            'wc-advanced-email-builder',
            array($this, 'render_admin_page')
        );
    }

    public function enqueue_admin_assets($hook) {
        if ('woocommerce_page_wc-advanced-email-builder' !== $hook) {
            return;
        }

        wp_enqueue_style('wc-advanced-email-builder-admin', 
            plugins_url('assets/css/admin.css', __FILE__),
            array(),
            '2.0.0'
        );

        wp_enqueue_script('wc-advanced-email-builder-admin',
            plugins_url('assets/js/admin.js', __FILE__),
            array('jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable', 'wp-color-picker'),
            '2.0.0',
            true
        );

        wp_localize_script('wc-advanced-email-builder-admin', 'wcAdvancedEmailBuilder', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wc-advanced-email-builder')
        ));

        wp_enqueue_media();
        wp_enqueue_style('wp-color-picker');
    }

    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>WooCommerce Gelişmiş E-posta Oluşturucu</h1>
            
            <div class="wc-advanced-email-builder-container">
                <!-- Sol Panel -->
                <div class="wc-advanced-email-builder-sidebar">
                    <h2>E-posta Türü</h2>
                    <select id="email-type">
                        <option value="new_order">Yeni Sipariş</option>
                        <option value="cancelled_order">İptal Edilen Sipariş</option>
                        <option value="failed_order">Başarısız Sipariş</option>
                        <option value="customer_on_hold_order">Sipariş Beklemede</option>
                        <option value="customer_processing_order">Sipariş İşleniyor</option>
                        <option value="customer_completed_order">Sipariş Tamamlandı</option>
                        <option value="customer_refunded_order">Sipariş İade Edildi</option>
                        <option value="customer_invoice">Fatura</option>
                        <option value="customer_note">Müşteri Notu</option>
                        <option value="customer_reset_password">Şifre Sıfırlama</option>
                        <option value="customer_new_account">Yeni Hesap</option>
                    </select>

                    <h2>Elementler</h2>
                    <div class="wc-advanced-email-builder-elements">
                        <button class="button" data-element="heading">Başlık Ekle</button>
                        <button class="button" data-element="text">Metin Ekle</button>
                        <button class="button" data-element="image">Resim Ekle</button>
                        <button class="button" data-element="button">Buton Ekle</button>
                        <button class="button" data-element="divider">Ayraç Ekle</button>
                        <button class="button" data-element="spacer">Boşluk Ekle</button>
                        <button class="button" data-element="columns">Sütunlar Ekle</button>
                    </div>

                    <h2>WooCommerce Değişkenleri</h2>
                    <div class="wc-advanced-email-builder-variables">
                        <button class="button" data-variable="{order_number}">Sipariş No</button>
                        <button class="button" data-variable="{order_date}">Sipariş Tarihi</button>
                        <button class="button" data-variable="{billing_first_name}">Müşteri Adı</button>
                        <button class="button" data-variable="{billing_last_name}">Müşteri Soyadı</button>
                        <button class="button" data-variable="{order_total}">Sipariş Toplamı</button>
                        <button class="button" data-variable="{site_title}">Site Başlığı</button>
                        <button class="button" data-variable="{site_url}">Site URL</button>
                    </div>
                </div>

                <!-- Sağ Panel -->
                <div class="wc-advanced-email-builder-content">
                    <div class="wc-advanced-email-builder-toolbar">
                        <button class="button button-primary" id="save-template">Şablonu Kaydet</button>
                        <button class="button" id="load-template">Şablon Yükle</button>
                        <button class="button" id="import-current-template">Mevcut Şablonu İçe Aktar</button>
                        <button class="button" id="preview-template">Önizleme</button>
                        <button class="button" id="mobile-preview">Mobil Önizleme</button>
                    </div>

                    <div id="email-builder-canvas" class="wc-advanced-email-builder-canvas">
                        <!-- Elementler buraya eklenecek -->
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    public function save_email_template() {
        check_ajax_referer('wc-advanced-email-builder');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('İzin hatası');
        }

        $template_data = isset($_POST['template']) ? wp_kses_post($_POST['template']) : '';
        $email_type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';

        if (empty($template_data) || empty($email_type)) {
            wp_send_json_error('Geçersiz veri');
        }

        update_option('wc_advanced_email_template_' . $email_type, $template_data);
        wp_send_json_success('Şablon başarıyla kaydedildi');
    }

    public function load_email_template() {
        check_ajax_referer('wc-advanced-email-builder');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('İzin hatası');
        }

        $email_type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        
        if (empty($email_type)) {
            wp_send_json_error('Geçersiz e-posta türü');
        }

        $template = get_option('wc_advanced_email_template_' . $email_type);
        wp_send_json_success($template);
    }

    public function import_current_template() {
        check_ajax_referer('wc-advanced-email-builder');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('İzin hatası');
        }

        $email_type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        
        if (empty($email_type)) {
            wp_send_json_error('Geçersiz e-posta türü');
        }

        // WooCommerce e-posta şablonunu al
        $mailer = WC()->mailer();
        $email = $mailer->get_emails()[$email_type];
        $template = $email->get_content();

        // HTML'i temizle ve güvenli hale getir
        $template = wp_kses_post($template);

        wp_send_json_success($template);
    }

    public function get_woocommerce_data() {
        check_ajax_referer('wc-advanced-email-builder');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('İzin hatası');
        }

        $data = array(
            'site_title' => get_bloginfo('name'),
            'site_url' => get_site_url(),
            'admin_email' => get_option('admin_email'),
            'currency' => get_woocommerce_currency_symbol(),
        );

        wp_send_json_success($data);
    }

    public function set_content_type() {
        return 'text/html';
    }

    public function customize_email_content($content, $email) {
        $template = get_option('wc_advanced_email_template_' . $email->id);
        
        if (!$template) {
            return $content;
        }

        // WooCommerce değişkenlerini gerçek değerlerle değiştir
        $order = $email->object;
        if ($order instanceof WC_Order) {
            $template = str_replace(
                array('{order_number}', '{order_date}', '{billing_first_name}', '{billing_last_name}', '{order_total}', '{site_title}', '{site_url}'),
                array($order->get_order_number(), $order->get_date_created()->date_i18n(get_option('date_format')), $order->get_billing_first_name(), $order->get_billing_last_name(), $order->get_formatted_order_total(), get_bloginfo('name'), get_site_url()),
                $template
            );
        }

        return $template;
    }
}

// Eklentiyi başlat
function wc_advanced_email_builder() {
    return WC_Advanced_Email_Builder::instance();
}

wc_advanced_email_builder();

