$(document).ready(function(){
    HtmlacademyEditor.init();
    DemoController.init();
});

const HtmlacademyEditor = {
    htmleditor: null,
    csseditor: null,
    refreshTimer: null,
    previewFrame: null,
    previewDocument: null,
    toolTip: null,
    tooltipContainer: null,

    init() {
        this.previewFrame = document.getElementById('preview');
        this.previewDocument = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
        this.initHtmlEditor();
        this.initCssEditor();
        setTimeout(() => {
            this.updatePreview(this.htmleditor)
        }, 1000);
    },

    initHtmlEditor() {
        if (!$('#html-editor').length) {
            return;
        }

        this.htmleditor = ace.edit('html-editor');
        this.htmleditor.getSession().setMode('ace/mode/html');
        this.initCommonEditorSettings(this.htmleditor);
        this.setHtmlEditorValue(this.htmleditor);
    },

    setHtmlEditorValue(editor) {
        // const fileUrl = $('#preview')[0].src;
        $.get('projects/barbershop/index.html?' + Math.random())
            .then((data) => {
            editor.setValue(data);
            editor.clearSelection();
        })
    },

    initCssEditor() {
        if (!$('#css-editor').length) {
            return;
        }

        this.csseditor = ace.edit('css-editor');
        this.csseditor.getSession().setMode('ace/mode/css');
        this.initCommonEditorSettings(this.csseditor);
        this.setCssEditorValue(this.csseditor);
    },

    setCssEditorValue(editor) {
        editor.setValue(`.active__frame-item{background:rgba(125, 200, 219, 0.5);transition:background .7s ease;}`)
    },

    initCommonEditorSettings(editor) {
        editor.$blockScrolling = Infinity; // временный фикс ace
        editor.setHighlightActiveLine(false);
        editor.setDisplayIndentGuides(false);
        editor.setShowPrintMargin(false);
        editor.setHighlightSelectedWord(false);
        editor.setBehavioursEnabled(false);
        editor.setFadeFoldWidgets(false);
        editor.setReadOnly(true);

        if (-1 !== location.href.indexOf('bigfont')) {
            editor.setFontSize('16px');
        }

        editor.getSession().setUseWrapMode(true);
        editor.getSession().setFoldStyle('manual');
        editor.getSession().setUseWorker(false);
        editor.renderer.setHScrollBarAlwaysVisible(false);

        editor.on('change', () => {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = setTimeout(() => {
                this.updatePreview()
            }, 100);
        });


        editor.on('click', (e) => {
            e.preventDefault();
            $('iframe#preview').contents().find('.active__frame-item').removeClass('active__frame-item');

            if ($(e.target).closest('.tooltip-info').length == 0)  {
                this.hideToolTip(editor.session);
            }

            this.selectInPreview(e, editor);
        });
    },

    updatePreview() {
        const previewWindow = this.previewFrame.contentWindow;
        let scrollLeft,
            scrollTop;

        if (previewWindow) {
            scrollLeft = previewWindow.pageXOffset;
            scrollTop = previewWindow.pageYOffset;

            const currentLine = this.htmleditor.getSelectionRange().start.row + 1;
            const currentLineValue = this.htmleditor.session.getLine(currentLine - 1);
            let editorValue = this.htmleditor.getSession().getValue();
            const matchTag = /<(\w+)/.exec(currentLineValue);

            // const matchClass = /<(?:.*?)class="(.*?)"(?:.*?)>/.exec(currentLineValue)
            // console.log(matchClass[1])
            if (matchTag !== null) {
                let newArr = [];
                console.log('1')
                newArr.push({'line': currentLine, 'tag': matchTag})
                newArr.forEach((el, ix) => el.id=ix)
                console.log(newArr)
            }
        }

        this.previewDocument.open();
        this.previewDocument.write(this.htmleditor.getSession().getValue());
        this.previewDocument.close();

        $('form', this.previewDocument).submit(function(){
            return false;
        });

        if (this.csseditor) {
            const cssCode = this.csseditor.getSession().getValue();
            this.injectCss(this.previewDocument, cssCode);
        }
        previewWindow.scrollTo(scrollLeft, scrollTop);

        this.updatePagetitle();
    },

    injectCss(preview, cssCode) {
        const styleElement = preview.createElement('style');
        styleElement.type = 'text/css';

        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = cssCode;
        } else {
            styleElement.appendChild(preview.createTextNode(cssCode));
        }
        preview.getElementsByTagName('head')[0].appendChild(styleElement);
    },

    selectInPreview(e, editor) {
        let newArr = [];
        const currentLine = editor.getSelectionRange().start.row + 1;
        const currentLineValue = editor.session.getLine(currentLine - 1);
        const matchTag = /<(\w+)/.exec(currentLineValue);
        // const matchClass = /<(?:.*?)class="(.*?)"(?:.*?)>/.exec(currentLineValue)
        // console.log(matchClass[1])
        if (matchTag !== null) {
            console.log('1')
            newArr.push({'line': currentLine, 'tag': matchTag[1]})
            newArr.forEach((el, ix) => el.id=ix)
            console.log(newArr)
        }
        console.log(e)
    },

    scrollInPreview(matchTag) {
        console.log(matchTag)
        const tag = $('iframe#preview').contents().find(`.${matchTag}`);
        window.scrollTo(tag.offsetLeft,tag.offsetTop)
        console.log(tag)
    },

    showToolTip (editor, tag) {
        let tooltipContainer = this.tooltipContainer;
        const LineWidgets = ace.require('ace/line_widgets').LineWidgets;
        const row = editor.getCursorPosition().row;
        const session = editor.session;

        tooltipContainer = document.createElement('div');
        tooltipContainer.classList.add('tooltip-info');

        setTimeout(() => {
            tooltipContainer.classList.add('tooltip-info__visible');
        }, 150);

        this.setToolTipContent(tooltipContainer, tag);
        this.toolTip = {
            row: row,
            el: tooltipContainer,
            type: 'infoMarker',
            fixedWidth:!0
        };

        if (!session.widgetManager) {
            session.widgetManager = new LineWidgets(session);
            session.widgetManager.attach(editor);
        }

        setTimeout(() => {
            session.widgetManager.addLineWidget(this.toolTip)
        }, 40)

    },

    setToolTipContent(container, tag) {
        $.getJSON('projects/barbershop/htmlbook.json?' + Math.random())
            .done(data => {
                if (data[tag] && data[tag].hasOwnProperty('value')) {
                    container.innerHTML = data[tag].value;
                } else {
                    container.innerHTML = 'Информация об этом тэге не найдена:(';
                }
            })
            .fail(() => {
                container.innerHTML = 'Ошибка доступа к базе';
            });
    },

    hideToolTip(session) {
        if (session.widgetManager) {
            $('.tooltip-info').removeClass('tooltip-info__visible');
            session.widgetManager.removeLineWidget(this.toolTip);
        }
    },

    updatePagetitle() {
        let title = $('title', this.previewDocument).text();
        if (!title || !title.length) {
            title = 'HTML Academy';
        } else {
            title = title + ' — HTML Academy';
        }
        $('.browser__container:first .tab:first').html('<div title="'+ title +'" class="title__container">' + title + '</div>');
    }
};

const DemoController = {
    init() {
        this.initZoom();
    },
    initZoom() {
        let self = this;
        $('.browser-zoom-toggle').click(function() {
            $('.browser-zoom-toggle').removeClass('browser-zoom-toggle-active');
            $(this).addClass('browser-zoom-toggle-active');
            self.switchZoom($(this).data().zoom);
        });
        this.switchZoom(100);
    },

    switchZoom(zoom) {
        $('.browser-zoom-toggle').each(function() {
            $('.browser__container').removeClass('browser-zoom-' + $(this).data().zoom);
        });
        $('.browser__container').addClass('browser-zoom-' + zoom);
    }
}