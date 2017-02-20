$(document).ready(function(){
    HtmlacademyEditor.init();
});

const HtmlacademyEditor = {
    htmleditor: null,
    csseditor: null,
    refreshTimer: null,
    previewFrame: null,
    previewDocument: null,

    init() {
        this.previewFrame = document.getElementById('preview');
        this.previewDocument = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
        this.initHtmlEditor();
        this.initCssEditor();

        setTimeout(() => {
            this.updatePreview()
        }, 300);
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
    <title>Барбершоп «Бородинский»</title>
  </head>
  <body>
    <ul>
    Щелкнув на любой строке редактора (где есть открывающий тег)
      <li>Тег выделится во втором окне визуально</li>
      <li>Внутри редактора под этой строкой появится текстовая подсказка</li>
      <li>Все теги в редакторе на отдельной строке</li>
    </ul>
    <div>
      <a href='#'>Я ссылка</a>
    </div>
  </body>
</html>`)
    },


    initCssEditor: function() {
        if (!$('#css-editor').length) {
            return;
        }

        this.csseditor = ace.edit("css-editor");
        this.csseditor.getSession().setMode("ace/mode/css");
        this.initCommonEditorSettings(this.csseditor);
        this.setCssEditorValue(this.csseditor);
    },

    setCssEditorValue(editor) {
        editor.setValue(`.active{ color: red}`)
    },

    initCommonEditorSettings(editor) {
        editor.$blockScrolling = Infinity; // временный фикс ace
        editor.setHighlightActiveLine(false);
        editor.setDisplayIndentGuides(false);
        editor.setShowPrintMargin(false);
        editor.setHighlightSelectedWord(false);
        editor.setBehavioursEnabled(false);
        editor.setFadeFoldWidgets(false);

        if (-1 !== location.href.indexOf("bigfont")) {
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
            }, 1000);
        });

        editor.on('click', (e) => {
            e.preventDefault();
            $('iframe#preview').contents().find('.active').removeClass('active');
            this.selectInFrame();
        });
    },

    updatePreview() {
        let previewWindow = this.previewFrame.contentWindow;
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
            let cssCode = this.csseditor.getSession().getValue();
            this.injectCss(this.previewDocument, cssCode);
        }

        previewWindow.scrollTo(scrollLeft, scrollTop);

        this.updatePagetitle();
    },

    injectCss(preview, cssCode) {
        var styleElement = preview.createElement("style");
        styleElement.type = "text/css";

        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = cssCode;
        } else {
            styleElement.appendChild(preview.createTextNode(cssCode));
        }
        preview.getElementsByTagName("head")[0].appendChild(styleElement);
    },

    selectInFrame() {
        let currentLine = this.htmleditor.getSelectionRange().start.row;
        let currentLineValue = this.htmleditor.session.getLine(currentLine);
        let match = /<(\w+)/.exec(currentLineValue);
        if (match !== null) {
            $('iframe#preview').contents().find(match[1]).addClass('active');
        }
    },

    updatePagetitle() {
        let title = $('title', this.previewDocument).text();
        if (!title || !title.length) {
            title = 'HTML Academy';
        } else {
            title = title + ' — HTML Academy';
        }
        $('.browser-container:first .tab:first').html('<div title="'+ title +'" class="title-container">' + title + '</div>');
    }
}


