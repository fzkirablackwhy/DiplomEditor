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
    targetElement: null,

    init() {
        this.previewFrame = document.getElementById('preview');
        this.previewDocument = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
        this.initHtmlEditor();
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

        editor.on('click', (e) => {
            e.preventDefault();
            $(this.previewFrame).contents().find('div.active-selection').remove();
            if ($(e.target).closest('.tooltip-info')){
                this.hideToolTip(editor.session);
            }
            this.selectInPreview(editor);
        });
    },

    setHtmlEditorValue(editor) {
        $.get('projects/barbershop/index.html?' + Math.random())
            .then((data) => {
                editor.setValue(data);
                editor.clearSelection();
        })
    },

    transformEditorValue(preview, htmlCode) {
        const transformHtmlCode = htmlCode.map((line, idx) => {
            const regEx = /(<\w+)(.*)|(<!DOCTYPE)/;
            const notDomEl = /(<html)|(<!DOCTYPE)/i;
            if (regEx.test(line) && line) {
                this.linesWithTag.push({
                    lineValue: line,
                    id: idx
                });
                const matchLine = regEx.exec(line);
                // adding ids to every line with tags and execute not DOM el-s
                notDomEl.test(line) ? line : line = `${matchLine[1]} id="${idx}"${matchLine[2]}`;
            }
            return line;
        });

        preview.open();
        preview.write(transformHtmlCode.join(''));
        preview.close();
    },

    updatePreview() {
        const previewWindow = this.previewFrame.contentWindow;

        let scrollLeft,
            scrollTop;

        if (previewWindow) {
            scrollLeft = previewWindow.pageXOffset;
            scrollTop = previewWindow.pageYOffset;
        }
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

    selectInPreview(editor) {
        const preview = this.previewFrame;
        const currentLine = editor.getSelectionRange().start.row;
        this.linesWithTag.map(line => {
            const { id } = line;

            if (id === currentLine) {
                this.targetElement = $(preview).contents().find( `#${id}`);
                this.showToolTip(editor, currentLine + 1);

                if (this.targetElement.position()) {
                    this.getElementCoordinates(this.targetElement);
                }
            }
        })
    },

    configLayerElement(styles, targetElement) {
        const layerElement = document.createElement('div');
        $(layerElement).css(styles);
        $(layerElement).toggleClass('active-selection');
        if ($(targetElement).parent()){
            $(targetElement).parent().prepend(layerElement);
        }
        $(layerElement).animate({
            opacity: 1
        }, 700 );

        this.scrollToElement(this.previewFrame, targetElement)
    },

    scrollToElement(preview, el) {
        $(preview).contents().find('body').animate({
            scrollTop: el.offset().top,
            scrollLeft: el.offset().left
        }, 1000);
    },

    getElementCoordinates(element) {
        const margin = element.css('margin');
        const padding = element.css('padding');
        const position = element.position();
        const width = element.width();
        const height = element.height();
        const { top, left } = position;
        const styles = {
            position : "absolute",
            top: top || 0,
            left: left || 0,
            zIndex: 5,
            opacity: 0,
            width: width,
            height: height,
            margin: margin,
            padding: padding,
            background: 'rgba(114,57,213, 0.4)',
            transition: 'background .7s ease'
        };

        this.configLayerElement(styles, element);
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

    hideToolTip(session) {
        if (session.widgetManager) {
            $('.tooltip-info').removeClass('tooltip-info__visible');
            session.widgetManager.removeLineWidget(this.toolTip);
        }
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
        this.initZoom()
    },
    initZoom() {
        let self = this;

        $('.browser-zoom-toggle').click(function() {
            $('.browser-zoom-toggle').removeClass('browser-zoom-toggle-active');
            $(this).addClass('browser-zoom-toggle-active');
            self.switchZoom($(this).data().zoom);
            self.recalculatePosition();
        });
        this.switchZoom(75);
    },

    recalculatePosition() {
        const { targetElement, previewFrame} = HtmlacademyEditor;
        $(previewFrame).contents().find('div.active-selection').remove();

        if (targetElement.position()){
            HtmlacademyEditor.getElementCoordinates(targetElement)
        }
    },

    switchZoom(zoom) {
        $('.browser-zoom-toggle').each(function() {
            $('.browser__container').removeClass('browser-zoom-' + $(this).data().zoom);
        });
        $('.browser__container').addClass('browser-zoom-' + zoom);
    }
};