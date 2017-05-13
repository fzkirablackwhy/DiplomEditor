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
        // Исходный код разметки стоит вынести в папку проекта
        // Также в папку проекта стоит вынести описания
        editor.setValue(`<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Барбершоп «Бородинский»</title>
    <base href="/projects/barbershop/">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <header class="main-header">
      <h1>
        <span class="visually-hidden">Барбершоп «Бородинский»<br></span>
        <img src="img/index-logo.png" width="368" height="204" alt="">
      </h1>
      <nav class="main-navigation">
        <ul class="site-navigation">
          <li>
            <a href="info.html">Информация</a>
          </li>
          <li>
            <a href="news.html">Новости</a>
          </li>
          <li>
            <a href="price.html">Прайс-лист</a>
          </li>
          <li>
            <a href="catalog.html">Магазин</a>
          </li>
          <li>
            <a href="contacts.html">Контакты</a>
          </li>
        </ul>

        <ul class="user-navigation">
          <li>
            <a class="login-link" href="login.html">Вход</a>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="features">
        <h2 class="visually-hidden">Преимущества</h2>
        <ul class="features-list">
          <li class="feature">
            <h3 class="feature-name">Быстро</h3>
            <p>Мы делаем свою работу быстро! Два часа пролетят незаметно и вы — счастливый обладатель стильной стрижки-минутки!</p>
          </li>
          <li class="feature">
            <h3 class="feature-name">Круто</h3>
            <p>Забудьте, как вы стриглись раньше. Мы сделаем из вас звезду футбола или кино! Во всяком случае внешне.</p>
          </li>
          <li class="feature">
            <h3 class="feature-name">Дорого</h3>
            <p>Наши мастера — профессионалы своего дела и не могут стоить дешево. К тому же, разве цена не дает определенный статус?</p>
          </li>
        </ul>
      </section>

      <div class="index-columns">
        <section class="news">
          <h2 class="news-title">Новости</h2>
          <ul class="news-preview">
            <li>
              <p>Нам наконец завезли Ягермайстер! Теперь вы можете пропустить стаканчик во время стрижки</p>
              <time datetime="2016-01-11">11 января</time>
            </li>
            <li>
              <p>В нашей команде пополнение, Борис «Бритва» Стригунец, обладатель множества титулов и наград пополнил наши стройные ряды</p>
              <time datetime="2016-01-18">18 января</time>
            </li>
          </ul>
          <a class="btn" href="news.html">Все новости</a>
        </section>

        <section class="gallery">
          <h2 class="gallery-title">Фотогалерея</h2>
          <figure class="gallery-content">
            <a href="#"><img src="img/photo-1.jpg" width="286" height="164" alt="Интерьер"></a>
            <a href="#"><img src="img/photo-2.jpg" width="286" height="164" alt="Кресло для бритья"></a>
          </figure>
        </section>
      </div>

      <div class="index-columns">
        <section class="contacts">
          <h2 class="contacts-title">Контактная информация</h2>
          <p>
            Барбершоп «Бородинский»<br>
            Адрес: г. Санкт-Петербург, Б. Конюшенная, д. 19/8<br>
            Телефон: +7 (812) 666-02-66
          </p>
          <p>
            Время работы:<br>
            пн — пт: с 10:00 до 22:00<br>
            сб — вс: с 10:00 до 19:00
          </p>
          <a class="btn" href="map.html">Как проехать</a>
          <a class="btn" href="contacts.html">Обратная связь</a>
        </section>

        <section class="appointment">
          <h2 class="appointment-title">Записаться</h2>
          <p>Укажите желаемую дату и время и мы свяжемся с вами для подтверждения брони</p>
          <form class="appointment-form" action="https://echo.htmlacademy.ru" method="post">
            <p>
              <label for="appointment-date-field">Дата</label>
              <input id="appointment-date-field" type="text" name="date" value="" placeholder="Дата">
            </p>
            <p>
              <label for="appointment-time-field">Время</label>
              <input id="appointment-time-field" type="text" name="time" value="" placeholder="Время">
            </p>
            <p>
              <label for="appointment-name-field">Ваше имя</label>
              <input id="appointment-name-field" type="text" name="name" value="" placeholder="Ваше имя">
            </p>
            <p>
              <label for="appointment-phone-field">Телефон</label>
              <input id="appointment-phone-field" type="tel" name="phone" value="" placeholder="Телефон">
            </p>
            <p>
              <button class="btn" type="submit">Отправить</button>
            </p>
          </form>
        </section>
      </div>
    </main>

    <footer class="main-footer">
      <div class="footer-columns">
        <p class="footer-contacts">
          Барбершоп «Бородинский»<br>
          Адрес: г. Санкт-Петербург, Б. Конюшенная, д. 19/8<br>
          <a href="map.html">Как нас найти?</a><br>
          Телефон: +7 (812) 666-02-66
        </p>
        <p class="footer-social">
          <b>Давайте дружить!</b>
          <span class="visually-hidden">Подписывайтесь на нас в соцсетях:</span>
          <a class="social-btn social-btn-vk" href="#">Вконтакте</a><span class="visually-hidden">,</span>
          <a class="social-btn social-btn-fb" href="#">Фейсбук</a><span class="visually-hidden">,</span>
          <a class="social-btn social-btn-inst" href="#">Инстаграм</a>
        </p>
        <p class="footer-copyright">
          <b>Разработано:</b> <a class="btn" href="https://htmlacademy.ru">HTML Academy</a>
        </p>
      </div>
    </footer>

    <section class="login" id="login">
      <h2 class="login-title">Личный кабинет</h2>
      <p>Здесь будет форма.</p>
    </section>
  </body>
</html>
`);
        editor.clearSelection();
    },

    initCssEditor() {
        if (!$('#css-editor').length) {
            return;
        }

        this.csseditor = ace.edit('css-editor');
        this.csseditor.getSession().setMode('ace/mode/css');
        this.initCommonEditorSettings(this.csseditor);
        // this.setCssEditorValue(this.csseditor);
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

        // setting initials styles to preview
        let init_styles = document.createElement('link');
        init_styles.rel = 'stylesheet';
        init_styles.href = 'styles/preview.css'
        this.previewDocument.getElementsByTagName('head')[0].appendChild(init_styles);

        // if (this.csseditor) {
        //     const cssCode = this.csseditor.getSession().getValue();
        //     this.injectCss(this.previewDocument, cssCode);
        // }
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
            this.showToolTip(editor, currentLine);
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
        $.getJSON('htmlbook.json?' + Math.random())
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
