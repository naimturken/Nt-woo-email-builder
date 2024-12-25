<?php
/*
Plugin Name: LezzetYurdu WooCommerce Email Builder
Plugin URI: https://lezzetyurdu.com.tr
Description: LezzetYurdu için özel geliştirilmiş WooCommerce e-posta şablon oluşturucu.
Version: 1.0.0
Author: Naim Türken
Author URI: https://lezzetyurdu.com.tr
License: GPL-2.0+
Text Domain: lezzetyurdu-email-builder
*/

if (!defined('ABSPATH')) {
    exit;
}

define('LYEB_VERSION', '1.0.0');
define('LYEB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LYEB_PLUGIN_URL', plugin_dir_url(__FILE__));

class LezzetYurdu_Email_Builder {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        // Admin menü ve sayfa
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // AJAX işleyiciler
        add_action('wp_ajax_lyeb_save_template', array($this, 'ajax_save_template'));
        add_action('wp_ajax_lyeb_load_template', array($this, 'ajax_load_template'));
        add_action('wp_ajax_lyeb_import_wc_template', array($this, 'ajax_import_wc_template'));
        
        // WooCommerce e-posta filtreleri
        add_filter('woocommerce_email_content_type', array($this, 'set_content_type'));
        add_filter('woocommerce_email_content', array($this, 'customize_email_content'), 10, 2);
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'LezzetYurdu E-posta Oluşturucu',
            'E-posta Oluşturucu',
            'manage_woocommerce',
            'lezzetyurdu-email-builder',
            array($this, 'render_admin_page')
        );
    }
    
    public function enqueue_admin_assets($hook) {
        if ('woocommerce_page_lezzetyurdu-email-builder' !== $hook) {
            return;
        }
        
        // Stil dosyaları
        wp_enqueue_style(
            'lyeb-admin-style',
            LYEB_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            LYEB_VERSION
        );
        
        // Script dosyaları
        wp_enqueue_script(
            'lyeb-admin-script',
            LYEB_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'jquery-ui-sortable', 'jquery-ui-draggable', 'jquery-ui-droppable', 'wp-color-picker'),
            LYEB_VERSION,
            true
        );
        
        // Medya yükleyici ve renk seçici
        wp_enqueue_media();
        wp_enqueue_style('wp-color-picker');
        
        // Localize script
        wp_localize_script('lyeb-admin-script', 'lyebData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('lyeb-nonce'),
            'brandColors' => array(
                'primary' => '#8CC63F',    // LezzetYurdu yeşil
                'secondary' => '#E57373',   // Aksiyonlar için kırmızı
                'text' => '#333333',        // Metin rengi
                'background' => '#FFFFFF'    // Arka plan rengi
            ),
            'companyInfo' => array(
                'name' => 'LezzetYurdu',
                'url' => 'https://lezzetyurdu.com.tr',
                'logo' => LYEB_PLUGIN_URL . 'assets/images/logo.png'
            )
        ));
    }
    
    public function render_admin_page() {
        include LYEB_PLUGIN_DIR . 'templates/admin-page.php';
    }
    
    public function ajax_save_template() {
        check_ajax_referer('lyeb-nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Yetkiniz bulunmuyor.');
        }
        
        $template_data = isset($_POST['template']) ? wp_kses_post($_POST['template']) : '';
        $email_type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';
        
        if (empty($template_data) || empty($email_type)) {
            wp_send_json_error('Geçersiz veri.');
        }
        
        update_option('lyeb_template_' . $email_type, $template_data);
        wp_send_json_success('Şablon başarıyla kaydedildi.');
    }
    
    public function ajax_load_template() {
        check_ajax_referer('lyeb-nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Yetkiniz bulunmuyor.');
        }
        
        $email_type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        
        if (empty($email_type)) {
            wp_send_json_error('Geçersiz e-posta türü.');
        }
        
        $template = get_option('lyeb_template_' . $email_type);
        wp_send_json_success($template);
    }
    
    public function ajax_import_wc_template() {
        check_ajax_referer('lyeb-nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error('Yetkiniz bulunmuyor.');
        }
        
        $email_type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        
        if (empty($email_type)) {
            wp_send_json_error('Geçersiz e-posta türü.');
        }
        
        // WooCommerce e-posta nesnesini al
        $mailer = WC()->mailer();
        $emails = $mailer->get_emails();
        
        if (!isset($emails[$email_type])) {
            wp_send_json_error('E-posta türü bulunamadı.');
        }
        
        $email = $emails[$email_type];
        $template = $email->get_content();
        
        wp_send_json_success(array(
            'content' => $template,
            'subject' => $email->get_subject(),
            'heading' => $email->get_heading()
        ));
    }
    
    public function set_content_type() {
        return 'text/html';
    }
    
    public function customize_email_content($content, $email) {
        $template = get_option('lyeb_template_' . $email->id);
        
        if (!$template) {
            return $content;
        }
        
        // WooCommerce değişkenlerini değiştir
        $order = $email->object;
        if ($order instanceof WC_Order) {
            $template = $this->replace_variables($template, $order);
        }
        
        return $template;
    }
    
    private function replace_variables($template, $order) {
        $variables = array(
            '{order_number}' => $order->get_order_number(),
            '{order_date}' => $order->get_date_created()->date_i18n(get_option('date_format')),
            '{billing_first_name}' => $order->get_billing_first_name(),
            '{billing_last_name}' => $order->get_billing_last_name(),
            '{billing_full_name}' => $order->get_formatted_billing_full_name(),
            '{billing_address}' => $order->get_formatted_billing_address(),
            '{shipping_address}' => $order->get_formatted_shipping_address(),
            '{order_total}' => $order->get_formatted_order_total(),
            '{site_title}' => get_bloginfo('name'),
            '{site_url}' => get_site_url()
        );
        
        return str_replace(array_keys($variables), array_values($variables), $template);
    }
}

// Eklentiyi başlat
function lezzetyurdu_email_builder() {
    return LezzetYurdu_Email_Builder::get_instance();
}

lezzetyurdu_email_builder();

