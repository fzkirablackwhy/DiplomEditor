$(document).ready(function(){
    HtmlacademyDemo.init();
});

var HtmlacademyDemo = {

    htmleditor: null,
    csseditor: null,
    refreshTimer: null,
    previewFrame: null,
    previewDocument: null,
    useLess: false,
    compiledCssViewer: null,
    preprocessor: {},

    init : function()
    {
        var self = this;
        this.previewFrame = document.getElementById('preview');
        this.previewDocument = this.previewFrame.contentDocument || this.previewFrame.contentWindow.document;
        this.initHtmlEditor();
        this.initCssEditor();
        setTimeout(function(){self.updatePreview()}, 300);
    },

    initHtmlEditor: function()
    {
        if (!$('#html-editor').length) {
            return;
        }

        this.htmleditor = ace.edit("html-editor");
        this.htmleditor.getSession().setMode("ace/mode/html");
        this.initCommonEditorSettings(this.htmleditor);
    },

    initCssEditor: function()
    {
        if (!$('#css-editor').length) {
            return;
        }

        this.csseditor = ace.edit("css-editor");
        this.csseditor.getSession().setMode("ace/mode/css");
        this.initCommonEditorSettings(this.csseditor);
    },

    initCommonEditorSettings: function(editor) {
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

        editor.on('change', (function(){
            clearTimeout(this.refreshTimer);
            this.refreshTimer = setTimeout((function(){
                this.updatePreview()
            }).bind(this), 1000);
        }).bind(this));
    },

    enableLess: function()
    {
        this.useLess = true;
    },

    initPreprocessor: function () {
        if (this.useLess) {
            this.preprocessor = new(less.Parser);
            this.preprocessor.name = 'LESS';
            this.csseditor.getSession().setMode('ace/mode/less');
            this.initCompiledCodeViewer();
        }
    },

    initCompiledCodeViewer: function () {
        this.compiledCssViewer = $('#compiled-css');
    },

    updatePreview: function()
    {
        var previewWindow = this.previewFrame.contentWindow;
        var scrollLeft,
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
            if (this.useLess) {
                var cssCode = this.compileCssCode();
            } else {
                var cssCode = this.csseditor.getSession().getValue();
            }
            cssCode = PrefixFree.prefixCSS(cssCode, true);
            this.injectCss(this.previewDocument, cssCode);
        }

        previewWindow.scrollTo(scrollLeft, scrollTop);

        this.updatePagetitle();
    },

    compileCssCode: function ()
    {
        var self = this;
        var session = self.csseditor.getSession();
        var code = session.getValue();
        var compiledCode = '';
        self.compiledCssViewer.text('');
        try {
            this.preprocessor.parse(code, function (err, tree) {
                if (err) {
                    self.compiledCssViewer.text('Ошибка разбора LESS');
                    self.highlightError(err);
                    return;
                }
                compiledCode = tree.toCSS();
                if (session.getAnnotations().length) {
                    session.clearAnnotations();
                }
                self.compiledCssViewer.text(compiledCode);
            });
        } catch (err) {
            self.compiledCssViewer.text('Ошибка разбора LESS');
            this.highlightError(err.line, err.column, err.message);
        }
        return compiledCode;
    },

    injectCss: function (preview, cssCode)
    {
        var styleElement = preview.createElement("style");
        styleElement.type = "text/css";

        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = cssCode;
        } else {
            styleElement.appendChild(preview.createTextNode(cssCode));
        }
        preview.getElementsByTagName("head")[0].appendChild(styleElement);
    },

    highlightError: function (errLine, errCol, errMessage)
    {
        this.csseditor.getSession().setAnnotations([{
            row: errLine - 1,
            column: errCol,
            text: errMessage,
            type: "error"
        }]);
    },

    updatePagetitle: function()
    {
        var title = $('title', this.previewDocument).text();
        if (!title || !title.length) {
            title = 'HTML Academy';
        } else {
            title = title + ' — HTML Academy';
        }
        $('.browser-container:first .tab:first').html('<div title="'+ title +'" class="title-container">' + title + '</div>');
    }
}

var DemoController = {

    step: 1,
    steps: null,
    callbacks: null,
    currentTab: null,

    init: function(steps, callbacks)
    {
        if (!steps) {
            return;
        }
        var self = this;
        this.steps = steps;
        this.callbacks = callbacks;
        this.htmleditor = HtmlacademyDemo.htmleditor;
        this.csseditor = HtmlacademyDemo.csseditor;

        var self = this;
        $('.demo-course .backward-control').click(function(){
            self.prevStep();
        });
        $('.demo-course .forward-control').click(function(){
            self.nextStep();
        });
        $('.nav-tabs a').click(function(){
            self.htmleditor.resize();
            self.csseditor.resize();
        });
        $('.editor-toggle .btn').click(function(){
            self.toggleTab($(this).text());
        });
        $('.demo-controls-toggle').click(function(){
            $('.demo-controls-container').toggleClass('demo-controls-mini');
        });
        this.initZoom();
        this.initWidthToggle();
        if (location.hash) {
            this.step = location.hash.substr(5);
        }
        this.gotoStep(this.step);
    },

    gotoStep: function(step)
    {
        if (step <= 1) {
            step = 1;
        }
        if (step >= this.steps.length) {
            step = this.steps.length;
        }
        this.step = step;
        $('.demo-course .step').hide();
        $('.demo-course .step:eq(' + (this.step - 1)  + ')').show();
        this.executeStepActions();
        this.refreshCounter();
    },

    prevStep: function()
    {
        if (this.step <= 1) {
            return;
        }
        this.step--;
        $('.demo-course .step').hide();
        $('.demo-course .step:eq(' + (this.step - 1)  + ')').show();
        this.executeStepActions();
        this.refreshCounter();
    },

    nextStep: function()
    {
        if (this.step >= this.steps.length) {
            return;
        }
        this.step++;
        $('.demo-course .step').hide();
        $('.demo-course .step:eq(' + (this.step - 1)  + ')').show();
        this.executeStepActions();
        this.refreshCounter();
    },

    refreshCounter: function()
    {
        $('.counter').text(this.step + ' / ' + this.steps.length);
        if (this.step >= this.steps.length) {
            $('.demo-course .forward-control').addClass('disabled');
        } else {
            $('.demo-course .forward-control').removeClass('disabled');
        }
        if (this.step <= 1) {
            $('.demo-course .backward-control').addClass('disabled');
        } else {
            $('.demo-course .backward-control').removeClass('disabled');
        }
    },

    executeStepActions: function()
    {
        var step = this.steps[(this.step - 1)];
        this.htmleditor.getSession().setValue(step['html']);
        this.csseditor.getSession().setValue(step['css']);
        HtmlacademyDemo.updatePreview();
        if ('html' == step['tab']) {
            this.toggleTab('html');
            $('.demo-course .nav-tabs li').removeClass('active');
            $('.demo-course .nav-tabs li:eq(0)').addClass('active');
            $('.tab-pane').removeClass('active');
            $('#html-tab').addClass('active');
            this.htmleditor.resize();
            this.csseditor.resize();
        }
        if ('css' == step['tab']) {
            this.toggleTab('css');
            $('.demo-course .nav-tabs li').removeClass('active');
            $('.demo-course .nav-tabs li:eq(1)').addClass('active');
            $('.tab-pane').removeClass('active');
            $('#css-tab').addClass('active');
            this.htmleditor.resize();
            this.csseditor.resize();
        }
        if ('less' == step['tab']) {
            this.toggleTab('less');
            this.htmleditor.resize();
            this.csseditor.resize();
        }
        this.currentTab = step['tab'];
        if (step.callbackId) {
            var callback = this.callbacks[step.callbackId];
            if (callback) {
                callback(this, this.htmleditor, this.csseditor);
            }
        }
        location.hash = 'step' + this.step;
    },

    toggleTab: function(tab)
    {
        tab = tab.toLowerCase();
        if (!$('.editor-toggle').length) {
            return;
        }
        $('.editor-toggle .btn').removeClass('disabled');
        if (tab === 'html') {
            $('#html-editor').css('z-index', '100');
            $('#css-editor').css('z-index', '50');
            $('.editor-toggle .btn:first-child').addClass('disabled');
        } else {
            $('#html-editor').css('z-index', '50');
            $('#css-editor').css('z-index', '100');
            $('.editor-toggle .btn:last-child').addClass('disabled');
        }
    },

    initZoom: function()
    {
        if (!$('.demo-zoom').length) {
            return;
        }
        var self = this;
        $('.demo-zoom-toggle').click(function(){
            $('.demo-zoom-toggle').removeClass('demo-zoom-toggle-active');
            $(this).addClass('demo-zoom-toggle-active');
            self.switchZoom($(this).data().zoom);
        });
        self.switchZoom(100);
    },

    switchZoom: function(zoom)
    {
        $('.demo-zoom-toggle').each(function(i) {
            $('.browser-container').removeClass('browser-zoom-' + $(this).data().zoom);
        });
        $('.browser-container').addClass('browser-zoom-' + zoom);
    },

    initWidthToggle: function()
    {
        if (!$('.browser-width').length) {
            return;
        }
        var self = this;
        $('.browser-width-toggle').click(function(){
            $('.browser-width-toggle').removeClass('browser-width-toggle-active');
            $(this).addClass('browser-width-toggle-active');
            self.switchWidth($(this).data().width);
        });
        self.switchWidth('full');
    },

    switchWidth: function(width)
    {
        $('.browser-width-toggle').each(function(i) {
            $('.browser-container').removeClass('browser-width-' + $(this).data().width);
        });
        $('.browser-container').addClass('browser-width-' + width);
    }
}