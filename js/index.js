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
    linesWithTag: [],
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

        // editor.on('change', () => {
        //     clearTimeout(this.refreshTimer);
        //     this.refreshTimer = setTimeout(() => {
        //         this.updatePreview()
        //     }, 100);
        // });

        editor.on('click', (e) => {
            e.preventDefault();
            $('iframe#preview').contents().find('.active__frame-item').removeClass('active__frame-item');

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
        };

        $('form', this.previewDocument).submit(function(){
            return false;
        });
        if (this.htmleditor) {
            const htmlCode = this.htmleditor.session.getDocument().$lines;
            this.transformEditorValue(this.previewDocument, htmlCode)
        }

        previewWindow.scrollTo(scrollLeft, scrollTop);
        this.updatePagetitle();
    },

    transformEditorValue(preview, htmlCode) {
        const transformHtmlCode = htmlCode.map((line, idx) => {
            const regEx = /(<\w+)(.*)/;

            if (regEx.test(line) && line) {
                this.linesWithTag.push({
                    lineValue: line,
                    id: idx
                });
                const matchLine = regEx.exec(line);
                // adding ids to every line with tags
                line = `${matchLine[1]} id="${idx}"${matchLine[2]}`;
            }
            return line;
        });

        preview.open();
        preview.write(transformHtmlCode.join(''));
        preview.close();
    },

    selectInPreview(editor) {
        const currentLine = editor.getSelectionRange().start.row;
        this.linesWithTag.map(line => {
            const { id } = line;
                // `#${idx}`
            if (id === currentLine) {
                console.log(currentLine, id)
                this.showToolTip(editor, currentLine+1);
                const targetElement = $('iframe#preview').contents().find( `#${id}`)
                console.log($('iframe#preview').contents().find( `#${id}`))
                var position = targetElement.position();
                console.log(position)
                targetElement.css({"background": "red"})
                return false;
            }
        })
    },

    scrollInPreview(matchTag) {
        const tag = $('iframe#preview').contents().find(`.${matchTag}`);
        window.scrollTo(tag.offsetLeft,tag.offsetTop)
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