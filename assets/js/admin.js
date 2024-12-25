jQuery(document).ready(function($) {
    var advancedEmailBuilder = {
        init: function() {
            this.canvas = $('#email-builder-canvas');
            this.emailType = $('#email-type');
            this.bindEvents();
            this.loadTemplate();
            this.initDragAndDrop();
        },

        bindEvents: function() {
            $('.wc-advanced-email-builder-elements button').on('click', this.addElement.bind(this));
            $('.wc-advanced-email-builder-variables button').on('click', this.insertVariable.bind(this));
            $('#save-template').on('click', this.saveTemplate.bind(this));
            $('#load-template').on('click', this.loadTemplate.bind(this));
            $('#import-current-template').on('click', this.importCurrentTemplate.bind(this));
            $('#preview-template').on('click', this.previewTemplate.bind(this));
            $('#mobile-preview').on('click', this.mobilePreview.bind(this));
            this.emailType.on('change', this.loadTemplate.bind(this));
            this.canvas.sortable({
                handle: '.element-handle',
                update: this.updateElementOrder.bind(this)
            });
            $(document).on('click', '.element-edit', this.editElement.bind(this));
            $(document).on('click', '.element-delete', this.deleteElement.bind(this));
        },

        addElement: function(e) {
            var type = $(e.currentTarget).data('element');
            var element = this.createElement(type);
            this.canvas.append(element);
        },

        createElement: function(type) {
            var element = $('<div>', {
                class: 'email-element',
                'data-type': type
            });

            var controls = $('<div>', {
                class: 'element-controls'
            }).append(
                $('<button>', {
                    class: 'button element-handle',
                    text: '↕'
                }),
                $('<button>', {
                    class: 'button element-edit',
                    text: 'Düzenle'
                }),
                $('<button>', {
                    class: 'button element-delete',
                    text: 'Sil'
                })
            );

            var content;
            switch(type) {
                case 'heading':
                    content = $('<h2>', {
                        text: 'Başlık',
                        contenteditable: 'true'
                    });
                    break;
                case 'text':
                    content = $('<p>', {
                        text: 'Metin içeriği buraya gelecek',
                        contenteditable: 'true'
                    });
                    break;
                case 'image':
                    content = $('<div>', {
                        class: 'image-placeholder',
                        text: 'Resim eklemek için tıklayın'
                    }).on('click', this.openMediaLibrary);
                    break;
                case 'button':
                    content = $('<button>', {
                        class: 'button',
                        text: 'Buton Metni',
                        contenteditable: 'true'
                    });
                    break;
                case 'divider':
                    content = $('<hr>');
                    break;
                case 'spacer':
                    content = $('<div>', {
                        style: 'height: 20px;'
                    });
                    break;
                case 'columns':
                    content = $('<div>', {
                        class: 'columns'
                    }).append(
                        $('<div>', { class: 'column', text: 'Sütun 1' }),
                        $('<div>', { class: 'column', text: 'Sütun 2' })
                    );
                    break;
            }

            return element.append(controls, content);
        },

        insertVariable: function(e) {
            var variable = $(e.currentTarget).data('variable');
            var focused = $(':focus');
            
            if (focused.length && focused.is('[contenteditable]')) {
                this.insertTextAtCursor(variable);
            }
        },

        insertTextAtCursor: function(text) {
            var sel, range;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                }
            }
        },

        saveTemplate: function() {
            var template = this.canvas.html();
            var type = this.emailType.val();

            $.ajax({
                url: wcAdvancedEmailBuilder.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'save_email_template',
                    nonce: wcAdvancedEmailBuilder.nonce,
                    template: template,
                    type: type
                },
                success: function(response) {
                    if (response.success) {
                        alert('Şablon başarıyla kaydedildi!');
                    } else {
                        alert('Şablon kaydedilirken bir hata oluştu.');
                    }
                }
            });
        },

        loadTemplate: function() {
            var type = this.emailType.val();
            var self = this;

            $.ajax({
                url: wcAdvancedEmailBuilder.ajaxUrl,
                type: 'GET',
                data: {
                    action: 'load_email_template',
                    nonce: wcAdvancedEmailBuilder.nonce,
                    type: type
                },
                success: function(response) {
                    if (response.success && response.data) {
                        self.canvas.html(response.data);
                    } else {
                        self.canvas.empty();
                    }
                }
            });
        },

        importCurrentTemplate: function() {
            var type = this.emailType.val();
            var self = this;

            $.ajax({
                url: wcAdvancedEmailBuilder.ajaxUrl,
                type: 'GET',
                data: {
                    action: 'import_current_template',
                    nonce: wcAdvancedEmailBuilder.nonce,
                    type: type
                },
                success: function(response) {
                    if (response.success && response.data) {
                        self.canvas.html(response.data);
                    } else {
                        alert('Mevcut şablon içe aktarılırken bir hata oluştu.');
                    }
                }
            });
        },

        updateElementOrder: function() {
            console.log('Elementlerin sırası güncellendi');
        },

        openMediaLibrary: function() {
            var image = $(this);
            var frame = wp.media({
                title: 'Resim Seç',
                multiple: false
            });

            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                image.html($('<img>', {
                    src: attachment.url,
                    alt: attachment.alt
                }));
            });

            frame.open();
        },

        editElement: function(e) {
            var element = $(e.target).closest('.email-element');
            var type = element.data('type');
            var content = element.children().not('.element-controls');

            var settings = $('<div>', {
                class: 'element-settings'
            });

            switch(type) {
                case 'heading':
                case 'text':
                    settings.append(
                        $('<label>', { text: 'Metin' }),
                        $('<textarea>', { text: content.text() }),
                        $('<label>', { text: 'Metin Rengi' }),
                        $('<input>', { type: 'text', class: 'color-picker', value: content.css('color') }),
                        $('<label>', { text: 'Arka Plan Rengi' }),
                        $('<input>', { type: 'text', class: 'color-picker', value: content.css('background-color') }),
                        $('<label>', { text: 'Yazı Tipi' }),
                        $('<select>', { class: 'font-selector' }).append(
                            $('<option>', { value: 'Arial', text: 'Arial' }),
                            $('<option>', { value: 'Helvetica', text: 'Helvetica' }),
                            $('<option>', { value: 'Times New Roman', text: 'Times New Roman' }),
                            $('<option>', { value: 'Georgia', text: 'Georgia' })
                        ),
                        $('<label>', { text: 'Yazı Boyutu' }),
                        $('<input>', { type: 'number', value: parseInt(content.css('font-size')), min: 8, max: 72 })
                    );
                    break;
                case 'button':
                    settings.append(
                        $('<label>', { text: 'Buton Metni' }),
                        $('<input>', { type: 'text', value: content.text() }),
                        $('<label>', { text: 'Buton Rengi' }),
                        $('<input>', { type: 'text', class: 'color-picker', value: content.css('background-color') }),
                        $('<label>', { text: 'Metin Rengi' }),
                        $('<input>', { type: 'text', class: 'color-picker', value: content.css('color') }),
                        $('<label>', { text: 'URL' }),
                        $('<input>', { type: 'url', value: content.attr('href') })
                    );
                    break;
                case 'spacer':
                    settings.append(
                        $('<label>', { text: 'Yükseklik (px)' }),
                        $('<input>', { type: 'number', value: content.height(), min: 1, max: 200 })
                    );
                    break;
                case 'columns':
                    settings.append(
                        $('<label>', { text: 'Sütun Sayısı' }),
                        $('<select>').append(
                            $('<option>', { value: 2, text: '2 Sütun' }),
                            $('<option>', { value: 3, text: '3 Sütun' }),
                            $('<option>', { value: 4, text: '4 Sütun' })
                        )
                    );
                    break;
            }

            settings.append(
                $('<button>', {
                    class: 'button button-primary',
                    text: 'Uygula',
                    click: function() {
                        advancedEmailBuilder.applyElementSettings(element, settings);
                    }
                })
            );

            element.append(settings);
            this.initColorPickers(settings);
        },

        applyElementSettings: function(element, settings) {
            var type = element.data('type');
            var content = element.children().not('.element-controls, .element-settings');

            switch(type) {
                case 'heading':
                case 'text':
                    content.text(settings.find('textarea').val()).css({
                        'color': settings.find('input').eq(0).val(),
                        'background-color': settings.find('input').eq(1).val(),
                        'font-family': settings.find('select').val(),
                        'font-size': settings.find('input[type="number"]').val() + 'px'
                    });
                    break;
                case 'button':
                    content.text(settings.find('input').eq(0).val()).css({
                        'background-color': settings.find('input').eq(1).val(),
                        'color': settings.find('input').eq(2).val()
                    }).attr('href', settings.find('input[type="url"]').val());
                    break;
                case 'spacer':
                    content.height(settings.find('input').val());
                    break;
                case 'columns':
                    var columnCount = settings.find('select').val();
                    content.empty();
                    for (var i = 0; i < columnCount; i++) {
                        content.append($('<div>', { class: 'column', text: 'Sütun ' + (i + 1) }));
                    }
                    break;
            }

            settings.remove();
        },

        deleteElement: function(e) {
            $(e.target).closest('.email-element').remove();
        },

        initColorPickers: function(context) {
            $('.color-picker', context).wpColorPicker();
        },

        previewTemplate: function() {
            var template = this.canvas.html();
            var previewWindow = window.open('', '_blank');
            previewWindow.document.write('<html><head><title>E-posta Önizleme</title></head><body>' + template + '</body></html>');
            previewWindow.document.close();
        },

        mobilePreview: function() {
            var template = this.canvas.html();
            var mobilePreview = $('<div>', { class: 'mobile-preview' }).append(
                $('<div>', { class: 'mobile-preview-content' }).html(template)
            );
            
            $('body').append(mobilePreview);
            
            mobilePreview.dialog({
                title: 'Mobil Önizleme',
                width: 400,
                height: 700,
                modal: true,
                close: function() {
                    $(this).remove();
                }
            });
        },

        initDragAndDrop: function() {
            $('.wc-advanced-email-builder-elements button').draggable({
                connectToSortable: '#email-builder-canvas',
                helper: 'clone',
                revert: 'invalid'
            });

            this.canvas.droppable({
                accept: '.wc-advanced-email-builder-elements button',
                drop: function(event, ui) {
                    var type = ui.draggable.data('element');
                    var element = advancedEmailBuilder.createElement(type);
                    $(this).append(element);
                }
            });
        }
    };

    advancedEmailBuilder.init();
});

