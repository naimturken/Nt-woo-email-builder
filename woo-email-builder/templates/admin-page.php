<div class="wrap">
    <h1>LezzetYurdu E-posta Oluşturucu</h1>
    
    <div class="lyeb-container">
        <!-- Sol Panel -->
        <div class="lyeb-sidebar">
            <div class="lyeb-section">
                <h2>E-posta Türü</h2>
                <select id="lyeb-email-type">
                    <option value="new_order">Yeni Sipariş</option>
                    <option value="cancelled_order">İptal Edilen Sipariş</option>
                    <option value="failed_order">Başarısız Sipariş</option>
                    <option value="customer_on_hold_order">Sipariş Beklemede</option>
                    <option value="customer_processing_order">Sipariş İşleniyor</option>
                    <option value="customer_completed_order">Sipariş Tamamlandı</option>
                    <option value="customer_refunded_order">Sipariş İade Edildi</option>
                    <option value="customer_invoice">Fatura</option>
                    <option value="customer_note">Müşteri Notu</option>
                </select>
                
                <div class="lyeb-actions">
                    <button id="lyeb-load-template" class="button">Şablon Yükle</button>
                    <button id="lyeb-import-wc" class="button">WooCommerce Şablonunu İçe Aktar</button>
                </div>
            </div>
            
            <div class="lyeb-section">
                <h2>Elementler</h2>
                <div class="lyeb-elements">
                    <div class="lyeb-element-group">
                        <h3>Temel Elementler</h3>
                        <button class="lyeb-element" data-type="header">Üst Bilgi</button>
                        <button class="lyeb-element" data-type="heading">Başlık</button>
                        <button class="lyeb-element" data-type="text">Metin</button>
                        <button class="lyeb-element" data-type="image">Görsel</button>
                        <button class="lyeb-element" data-type="button">Buton</button>
                        <button class="lyeb-element" data-type="divider">Ayraç</button>
                        <button class="lyeb-element" data-type="spacer">Boşluk</button>
                    </div>
                    
                    <div class="lyeb-element-group">
                        <h3>Düzen Elementleri</h3>
                        <button class="lyeb-element" data-type="columns-2">2 Sütun</button>
                        <button class="lyeb-element" data-type="columns-3">3 Sütun</button>
                        <button class="lyeb-element" data-type="container">Konteyner</button>
                    </div>
                    
                    <div class="lyeb-element-group">
                        <h3>WooCommerce Elementleri</h3>
                        <button class="lyeb-element" data-type="order-details">Sipariş Detayları</button>
                        <button class="lyeb-element" data-type="order-items">Sipariş Ürünleri</button>
                        <button class="lyeb-element" data-type="customer-details">Müşteri Bilgileri</button>
                        <button class="lyeb-element" data-type="shipping-address">Teslimat Adresi</button>
                        <button class="lyeb-element" data-type="billing-address">Fatura Adresi</button>
                    </div>
                    
                    <div class="lyeb-element-group">
                        <h3>Sosyal Medya</h3>
                        <button class="lyeb-element" data-type="social-icons">Sosyal Medya İkonları</button>
                        <button class="lyeb-element" data-type="footer">Alt Bilgi</button>
                    </div>
                </div>
            </div>
            
            <div class="lyeb-section">
                <h2>WooCommerce Değişkenleri</h2>
                <div class="lyeb-variables">
                    <button class="lyeb-variable" data-variable="{order_number}">Sipariş No</button>
                    <button class="lyeb-variable" data-variable="{order_date}">Sipariş Tarihi</button>
                    <button class="lyeb-variable" data-variable="{billing_first_name}">Müşteri Adı</button>
                    <button class="lyeb-variable" data-variable="{billing_last_name}">Müşteri Soyadı</button>
                    <button class="lyeb-variable" data-variable="{billing_full_name}">Müşteri Tam Adı</button>
                    <button class="lyeb-variable" data-variable="{billing_address}">Fatura Adresi</button>
                    <button class="lyeb-variable" data-variable="{shipping_address}">Teslimat Adresi</button>
                    <button class="lyeb-variable" data-variable="{order_total}">Sipariş Toplamı</button>
                </div>
            </div>
        </div>
        
        <!-- Ana İçerik -->
        <div class="lyeb-content">
            <div class="lyeb-toolbar">
                <div class="lyeb-toolbar-left">
                    <button id="lyeb-preview" class="button">
                        <span class="dashicons dashicons-visibility"></span>
                        Önizleme
                    </button>
                    <button id="lyeb-mobile-preview" class="button">
                        <span class="dashicons dashicons-smartphone"></span>
                        Mobil Önizleme
                    </button>
                </div>
                
                <div class="lyeb-toolbar-right">
                    <button id="lyeb-save" class="button button-primary">
                        <span class="dashicons dashicons-saved"></span>
                        Şablonu Kaydet
                    </button>
                </div>
            </div>
            
            <div id="lyeb-builder" class="lyeb-builder">
                <!-- E-posta içeriği buraya gelecek -->
            </div>
        </div>
        
        <!-- Sağ Panel (Element Ayarları) -->
        <div class="lyeb-settings-panel" style="display: none;">
            <div class="lyeb-settings-header">
                <h2>Element Ayarları</h2>
                <button class="lyeb-close-settings">
                    <span class="dashicons dashicons-no-alt"></span>
                </button>
            </div>
            
            <div class="lyeb-settings-content">
                <!-- Seçili elementin ayarları buraya gelecek -->
            </div>
        </div>
    </div>
</div>

