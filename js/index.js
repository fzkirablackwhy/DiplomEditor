$(document).ready(function(){
    HtmlacademyEditor.init();
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
            this.updatePreview()
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
        editor.setValue(`<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <ul>
    Щелкнув на любой строке редактора (где есть открывающий тег)
      <li>Тег выделится во втором окне визуально</li>
      <li>Внутри редактора под этой строкой появится текстовая подсказка</li>
      <li>Все теги в редакторе на отдельной строке</li>
    </ul>
    <div>
      <a href='#'>Ссылка</a>
      <p>Абзац</p>
      <input placeholder="Дата">
    </div>
  </body>
</html>`);
        editor.clearSelection();
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
        editor.setValue(`.active{background:rgba(125, 200, 219, 0.5);transition:background .7s ease;}`)
    },

    initCommonEditorSettings(editor) {
        editor.$blockScrolling = Infinity; // временный фикс ace
        editor.setHighlightActiveLine(false);
        editor.setDisplayIndentGuides(false);
        editor.setShowPrintMargin(false);
        editor.setHighlightSelectedWord(false);
        editor.setBehavioursEnabled(false);
        editor.setFadeFoldWidgets(false);

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
            $('iframe#preview').contents().find('.active').removeClass('active');

            if ($(e.target).closest('.tooltip-info').length == 0)  {
                this.hideToolTip(editor.session);
            }

            this.selectInPreview(editor);
        });
    },

    updatePreview() {
        const previewWindow = this.previewFrame.contentWindow;
        let scrollLeft,
            scrollTop;

        if (previewWindow) {
            scrollLeft = previewWindow.pageXOffset;
            scrollTop = previewWindow.pageYOffset;
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

    selectInPreview(editor) {
        const currentLine = editor.getSelectionRange().start.row;
        const currentLineValue = editor.session.getLine(currentLine);
        const match = /<(\w+)/.exec(currentLineValue);

        if (match !== null) {
            $('iframe#preview').contents().find(match[1]).addClass('active');
            this.showToolTip(editor, match[1]);
        }
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
        }, 50);

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

    setToolTipContent(container, tag){
        $.getJSON('htmlbook.json')
            .then(data => {
                container.innerHTML = data[tag].value;
            })
            .fail(() => {
                container.innerHTML = 'Информация об этом тэге не найдена:(';
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


