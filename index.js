// ==UserScript==
// @name         AutoSendEmail_booking
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       slaawwa
// @match        https://booking.uz.gov.ua/
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    let $;
    let app = {
        _$: null,
        $ : null,
        data: {
            timer: null,
            _cc: localStorage._cc || null,
            email: localStorage.email,
            intervalPos: localStorage._intervalPos || (300 * 1000), // 5 min
            intervalNeg: localStorage._intervalNeg || (30 * 1000), // 30 sec
            post: {
                from: null, // '2200001' // Kyiv
                to: null,   // '2210900' // K.Rig
                date: null, // '2018-03-07'
                time: null, // '20:00'
                another_ec: 0,
            },
        },
        addJQuery: (src = '//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js') => {
            app._$ = jQuery.noConflict();
            let script = document.createElement("script"),
                node = document.getElementsByTagName('head')[0];
            script.type="text/javascript";
            script.onload = app.ready;
            script.src=src;
            node.appendChild(script);
            return app;
        },
        ready: () => {
            $ = app.$ = jQuery.noConflict();
            window.$ = window.jQuery = app._$;
            window.app = app;
            
            app.set.html();
            
            return app;
        },
        sendEmail: (count) => {
            console.log('email:', app.data.email);
            app.$.ajax({
                url: `https://formspree.io/${app.data.email}`, 
                method: "POST",
                data: {
                    _subject: `Квитки на ${app.data.post.date_dep}`,
                    message: `${app.data.post.station_from} - ${app.data.post.station_till} (${app.data.post.date_dep}) - Знайдено: ${count}`,
                    _cc: app.data._cc,
                },
                dataType: "json"
            }).done(res => {
                console.log('email:::', res);
            });
            return app;
        },
        fn: {
            notificate: function(e) {
                e.preventDefault();
                app.get
                    .from()
                    .to()
                    .date();
                app.set.check();
                app.$stop.show();
                app.$noti.hide();
            },
            stop: function() {
                clearTimeout(app.data.timer);
                app.$stop.hide();
                app.$noti.show();
            },
        },
        get: {
            from: () => {
                app.data.post.from = app.$('[name="from"]').val();
                return app.get;
            },
            to: () => {
                app.data.post.till = app.$('[name="to"]').val();
                return app.get;
            },
            date: () => {
                app.data.post.date = app.$('[name="date"]').val();
                app.data.post.time = app.$('[name="time"]').val();
                return app.get;
            },
            email: (e) => {
                e.preventDefault();
                app.data.email = prompt('Введіть емейл сповіщення', app.data.email);
                if (app.data.email) {
                    app.$noti.show();
                    localStorage.email = app.data.email;
                }
                return app.get;
            },
        },
        set: {
            html: () => {
                // Додати кнопку сповістити 
                let style = app.data.email? '': 'style="display: none"';
                app.$noti = app.$(`<button href="#" ${style}>Сповістити</button>`)
                    .appendTo('.mobile-version')
                    .click(app.fn.notificate)
                    .before('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
                    .after(' на ');
                
                // Додати кнопку стоп 
                app.$stop = app.$(`<button href="#" style="display: none">Стоп</button>`)
                    .click(app.fn.stop);
                app.$noti.after(app.$stop);
                
                // Додати кнопку установки емейлу 
                app.$(`<button href="#">емейл</button>`)
                    .appendTo('.mobile-version')
                    .click(app.get.email);
                
                return app.set;
            },
            check: () => {

                clearTimeout(app.data.timer);
                window.$.ajax({
                    url: '//booking.uz.gov.ua/train_search/',
                    method: 'POST',
                    data: app.data.post,
                }).done(function(res) {
                    let _res;
                    if (res.error) {
                        _res = res.value;
                        app.data.timer = setTimeout(app.set.check, app.data.intervalNeg);
                    } else {
                        app.data.timer = setTimeout(app.set.check, app.data.intervalPos);
                        _res = res.value.length;
                        app.sendEmail(_res);
                    }
                    console.info('RES:', _res);
                }).error(function(err) {
                    console.info('ERR:', err);
                });

                return app.set;
            },
        },
        init: () => {
            console.log('http://booking.uz.gov.ua/-');
            app
                .addJQuery()
                /*.check()*/;
        },
    };
    app.init();
})();