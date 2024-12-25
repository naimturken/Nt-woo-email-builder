jQuery(document).ready(function($) {
    const EmailBuilder = {
        init: function() {
            this.builder = $('#lyeb-builder');
            this.emailType = $('#lyeb-email-type');
            this.settingsPanel = $('.lyeb-settings-panel');
            
            this.initDragAndDrop();
            this.bindEvents();
            this.loadTemplate();
        },
        
        bindEvents: function() {
            // Şablon yükleme ve kaydetme
            $('#lyeb-load-template').on('click', this.loadTemplate.bind(this));
            $('#lyeb-save').on('click', this.saveTemplate.bind(this));
            $('#lyeb-import-wc').on('click', this.importWCTemplate.bind(this));
            
            // Önizleme
            $('#lyeb-preview').on('click', this.showPreview.bind(this));
            $('#lyeb-mobile-preview').on('click', this.showMobilePreview.bind(this));
            
            // Element düzenleme
            $(document).on('click', '.lyeb-element-edit', this.editElement.bind(this));
            $(document).on('click', '.lyeb-element-delete', this.deleteElement.bind(this));
            $('.lyeb-close-settings').on('click', this.closeSettings.bind(this));
            
            // Değişken ekleme
            $('.lyeb-variable').on('click', this.insertVariable.bind(this));
        },
        
        initDragAndDrop: function() {
            // Element sürükle-bırak
            $('.lyeb-element').draggable({
                helper: 'clone',
                connectToSortable: '#lyeb-builder',
                revert: 'invalid'
            });
            
            this.builder.sortable({
                placeholder: 'lyeb-dropzone',
                handle: '.lyeb-element-handle',
                receive: function(event, ui) {
                    const elementType = ui.item.data('type');
                    const newElement = EmailBuilder.createElement(elementType);
                    ui.item.replaceWith(newElement);
                }
            });
        },
        
        createElement: function(type) {
            const element = $('<div>', {
                class: 'lyeb-builder-element',
                'data-type': type
            });
            
            const controls = $('<div>', {
                class: 'lyeb-element-controls'
            }).append(
                $('<button>', {
                    class: 'lyeb-element-handle button',
                    html: '<span class="dashicons dashicons-move"></span>'
                }),
                $('<button>', {
                    class: 'lyeb-element-edit button',
                    html: '<span class="dashicons dashicons-edit"></span>'
                }),
                $('<button>', {
                    class: 'lyeb-element-delete button',
                    html: '<span class="dashicons dashicons-trash"></span>'
                })
            );
            
            let content;
            switch(type) {
                case 'header':
                    content = this.createHeader();
                    break;
                case 'text':
                    content = this.createText();
                    break;
                case 'image':
                    content = this.createImage();
                    break;
                case 'button':
                    content = this.createButton();
                    break;
                case 'columns-2':
                    content = this.createColumns(2);
                    break;
                case 'columns-3':
                    content = this.createColumns(3);
                    break;
                // Diğer element tipleri...
            }
            
            return element.append(controls, content);
        },
        
        createHeader: function() {
            return $('<div>', {
                class: 'lyeb-header'
            }).append(
                $('<img>', {
                    src: lyebData.companyInfo.logo,
                    alt: lyebData.companyInfo.name
                })
            );
        },
        
        createText: function() {
            return $('<div>', {
                class: 'lyeb-text',
                contenteditable: true,
                text: 'Metin içeriği buraya gelecek'
            });
        },
        
        createImage: function() {
            return $('<div>', {
                class: 'lyeb-image-container'
            }).append(
                $('<div>', {
                    class: 'lyeb-image-placeholder',
                    text: 'Resim eklemek için tıklayın'
                }).on('click', this.openMediaLibrary)
            );
        },
        
        createButton: function() {
            return $('<div>', {
                class: 'lyeb-button-container'
            }).append(
                $('<a>', {
                    href: '#',
                    class: 'lyeb-button',
                    text: 'Butona Tıkla'
                })
            );
        },
        
        createColumns: function(count) {
            const container = $('<div>', {
                class: 'lyeb-columns'
            });
            
            for (let i = 0; i < count; i++) {
                container.append(
                    $('<div>', {
                        class: 'lyeb-column',
                        'data-column': i + 1
                    }).append(
                        $('<div>', {
                            class: 'lyeb-column-content',
                            text: `Sütun ${i + 1}`
                        })
                    )
                );
            }
            
            return container;
        },
        
        editElement: function(e) {
            const element = $(e.target).closest('.lyeb-builder-element');
            const type = element.data('type');
            
            this.showSettings(element, type);
        },
        
        showSettings: function(element, type) {
            const settings = this.getElementSettings(type);
            this.settingsPanel.find('.lyeb-settings-content').html(settings);
            this.settingsPanel.show();
            
            // Renk seçici ve diğer kontrolleri başlat
            this.initializeControls(element);
        },
        
        getElementSettings: function(type) {
            let settings = $('<div>');
            
            switch(type) {
                case 'text':
                    settings.append(
                        this.createSettingField('Metin', 'textarea', 'content'),
                        this.createSettingField('Yazı Tipi', 'select', 'font-family', {
                            options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia']
                        }),
                        this.createSettingField('Yazı Boyutu', 'number', 'font-size'),
                        this.createSettingField('Metin Rengi', 'color', 'color'),
                        this.createSettingField('Arka Plan', 'color', 'background-color')
                    );
                    break;
                    
                case 'button':
                    settings.append(
                        this.createSettingField('Buton Metni', 'text', 'text'),
                        this.createSettingField('URL', 'url', 'href'),
                        this.createSettingField('Buton Rengi', 'color', 'background-color'),
                        this.createSettingField('Metin Rengi', 'color', 'color'),
                        this.createSettingField('Kenar Yuvarlaklığı', 'number', 'border-radius')
                    );
                    break;
                    
                // Diğer element tipleri için ayarlar...
            }
            
            return settings;
        },
        
        createSettingField: function(label, type, name, options = {}) {
            const field = $('<div>', { class: 'lyeb-setting-field' });
            
            field.append($('<label>', { text: label }));
            
            switch(type) {
                case 'text':
                case 'number':
                case 'url':
                    field.append($('<input>', {
                        type: type,
                        name: name,
                        class: 'lyeb-setting-input'
                    }));
                    break;
                    
                case 'textarea':
                    field.append($('<textarea>', {
                        name: name,
                        class: 'lyeb-setting-input'
                    }));
                    break;
                    
                case 'select':
                    const select = $('<select>', {
                        name: name,
                        class: 'lyeb-setting-input'
                    });
                    
                    if (options.options) {
                        options.options.forEach(option => {
                            select.append($('<option>', {
                                value: option,
                                text: option
                            }));
                        });
                    }
                    
                    field.append(select);
                    break;
                    
                case 'color':
                    field.append($('<input>', {
                        type: 'text',
                        name: name,
                        class: 'lyeb-color-picker'
                    }));
                    break;
            }
            
            return field;
        },
        
        initializeControls: function(element) {
            // Renk seçicileri başlat
            $('.lyeb-color-picker').wpColorPicker({
                change: function(event, ui) {
                    const property = $(this).attr('name');
                    element.css(property, ui.color.toString());
                }
            });
            
            // Diğer kontrol değişikliklerini izle
            $('.lyeb-setting-input').on('change', function() {
                const property = $(this).attr('name');
                const value = $(this).val();
                
                if (property === 'content') {
                    element.find('.lyeb-text').text(value);
                } else if (property === 'text') {
                    element.find('.lyeb-button').text(value);
                } else if (property === 'href') {
                    element.find('.lyeb-button').attr('href', value);
                } else {
                    element.css(property, value);
                }
            });
        },
        
        deleteElement: function(e) {
            $(e.target).closest('.lyeb-builder-element').remove();
            this.closeSettings();
        },
        
        closeSettings: function() {
            this.settingsPanel.hide();
        },
        
        openMediaLibrary: function() {
            const image = $(this);
            const frame = wp.media({
                title: 'Resim Seç',
                multiple: false
            });
            
            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                image.html($('<img>', {
                    src: attachment.url,
                    alt: attachment.alt
                }));
            });
            
            frame.open();
        },
        
        insertVariable: function(e) {
            const variable = $(e.target).data('variable');
            const focused = $(':focus');
            
            if (focused.length && focused.is('[contenteditable]')) {
                this.insertTextAtCursor(variable);
            }
        },
        
        insertTextAtCursor: function(text) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const node = document.createTextNode(text);
            range.insertNode(node);
        },
        
        loadTemplate: function() {
            const emailType = this.emailType.val();
            
            $.ajax({
                url: lyebData.ajaxUrl,
                type: 'GET',
                data: {
                    action: 'lyeb_load_template',
                    nonce: lyebData.nonce,
                    type: emailType
                },
                success: (response) => {
                    if (response.success && response.data) {
                        this.builder.html(response.data);
                    }
                }
            });
        },
        
        saveTemplate: function() {
            const emailType = this.emailType.val();
            const template = this.builder.html();
            
            $.ajax({
                url: lyebData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'lyeb_save_template',
                    nonce: lyebData.nonce,
                    type: emailType,
                    template: template
                },
                success: (response) => {
                    if (response.success) {
                        alert('Şablon başarıyla kaydedildi!');
                    } else {
                        alert('Şablon kaydedilirken bir hata oluştu.');
                    }
                }
            });
        },
        
        importWCTemplate: function() {
            const emailType = this.emailType.val();
            
            $.ajax({
                url: lyebData.ajaxUrl,
                type: 'GET',
                data: {
                    action: 'lyeb_import_wc_template',
                    nonce: lyebData.nonce,
                    type: emailType
                },
                success: (response) => {
                    if (response.success) {
                        this.builder.html(response.data.content);
                    } else {
                        alert('Şablon içe aktarılırken bir hata oluştu.');
                    }
                }
            });
        },
        
        showPreview: function() {
            const template = this.builder.html();
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                    <head>
                        <title>E-posta Önizleme</title>
                        <style>
                            body { margin: 0; padding: 20px; }
                            .lyeb-preview-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: #fff;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="lyeb-preview-container">
                            ${template}
                        </div>
                    </body>
                </html>
            `);
            win.document.close();
        },
        
        showMobilePreview: function() {
            const template = this.builder.html();
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                    <head>
                        <title>Mobil Önizleme</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { margin: 0; padding: 20px; }
                            .lyeb-preview-container {
                                max-width: 375px;
                                margin: 0 auto;
                                background: #fff;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="lyeb-preview-container">
                            ${template}
                        </div>
                    </body>
                </html>
            `);
            win.document.close();
        }
    };
    
    // Başlat
    EmailBuilder.init();
});

