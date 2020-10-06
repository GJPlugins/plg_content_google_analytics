/***********************************************************************************************************************
 * ╔═══╗ ╔══╗ ╔═══╗ ╔════╗ ╔═══╗ ╔══╗  ╔╗╔╗╔╗ ╔═══╗ ╔══╗   ╔══╗  ╔═══╗ ╔╗╔╗ ╔═══╗ ╔╗   ╔══╗ ╔═══╗ ╔╗  ╔╗ ╔═══╗ ╔╗ ╔╗ ╔════╗
 * ║╔══╝ ║╔╗║ ║╔═╗║ ╚═╗╔═╝ ║╔══╝ ║╔═╝  ║║║║║║ ║╔══╝ ║╔╗║   ║╔╗╚╗ ║╔══╝ ║║║║ ║╔══╝ ║║   ║╔╗║ ║╔═╗║ ║║  ║║ ║╔══╝ ║╚═╝║ ╚═╗╔═╝
 * ║║╔═╗ ║╚╝║ ║╚═╝║   ║║   ║╚══╗ ║╚═╗  ║║║║║║ ║╚══╗ ║╚╝╚╗  ║║╚╗║ ║╚══╗ ║║║║ ║╚══╗ ║║   ║║║║ ║╚═╝║ ║╚╗╔╝║ ║╚══╗ ║╔╗ ║   ║║
 * ║║╚╗║ ║╔╗║ ║╔╗╔╝   ║║   ║╔══╝ ╚═╗║  ║║║║║║ ║╔══╝ ║╔═╗║  ║║─║║ ║╔══╝ ║╚╝║ ║╔══╝ ║║   ║║║║ ║╔══╝ ║╔╗╔╗║ ║╔══╝ ║║╚╗║   ║║
 * ║╚═╝║ ║║║║ ║║║║    ║║   ║╚══╗ ╔═╝║  ║╚╝╚╝║ ║╚══╗ ║╚═╝║  ║╚═╝║ ║╚══╗ ╚╗╔╝ ║╚══╗ ║╚═╗ ║╚╝║ ║║    ║║╚╝║║ ║╚══╗ ║║ ║║   ║║
 * ╚═══╝ ╚╝╚╝ ╚╝╚╝    ╚╝   ╚═══╝ ╚══╝  ╚═╝╚═╝ ╚═══╝ ╚═══╝  ╚═══╝ ╚═══╝  ╚╝  ╚═══╝ ╚══╝ ╚══╝ ╚╝    ╚╝  ╚╝ ╚═══╝ ╚╝ ╚╝   ╚╝
 *----------------------------------------------------------------------------------------------------------------------
 * @author Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
 * @date 03.10.2020 20:28
 * @copyright  Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later;
 **********************************************************************************************************************/
window.plgContentGoogleAnalyticsImportExport = function (){
    var $ = jQuery ;
    var self = this ;
    this.__group = 'content' ;
    this.__plugin = 'plg_content_google_analytics' ;
    this.AjaxDefaultData = {
        group : this.__group,
        plugin : this.__plugin ,
        option : 'com_ajax' ,
        format : 'json' ,
        task : null ,
    };
    this.Init = function (){
        self.addEvt();
    }
    this.addEvt = function (){
        $('.ExportStart').on('click' , self.Export )
        $('.ImportStart').on('click' , self.Import )

    }
    this.Import = function (event){
        event.preventDefault();
        var Data = {};
        var data = $.extend( true , self.AjaxDefaultData , Data );
        data.task = 'getImportForm';
        self.sendData(data).then(function (response){
            wgnz11.__loadModul.Fancybox().then(function (a) {
                a.open( response.data.html , {
                    baseClass: "modalExport",
                    afterShow   : function(instance, current) {
                        $('.modalExport .button-apply').on('click', function (event) {
                            event.preventDefault();
                            var $form = $(this).closest('form')
                            var textarea =  $form.find('textarea')[0] ;
                            var Data = {
                                Settings : textarea.value.trim()
                            };
                            var data = $.extend( true , self.AjaxDefaultData , Data );
                            data.task = 'ImportSetting';
                            self.sendData(data).then(function (response){
                                if (!response.success){
                                    $form.html( response.data.html )
                                    return ;
                                }
                                $form.html( response.data.html );
                                document.location.reload();
                            });

                        });
                    },
                });
                console.log( response ) ;
            });
        });
    };
    this.Export = function (event){
        event.preventDefault();
        var Data = {};
        var data = $.extend( true , self.AjaxDefaultData , Data );
        data.task = 'ExportSetting';
        self.sendData(data).then(function (response){
            wgnz11.__loadModul.Fancybox().then(function (a) {
                a.open( response.data.html , {
                    baseClass: "modalExport",
                    afterShow   : function(instance, current)   {
                         $('.modalExport .button-apply').on('click' , function (event){
                             event.preventDefault();
                             var copyText = $(this).closest('form').find('textarea')[0];
                             copyText.select();
                             copyText.setSelectionRange(0, 99999)
                             document.execCommand("copy");
                             alert("Скопировано !!! ");
                         });
                    },
                });
            });
            console.log(response);
        },function (err){console.log(err)});
    }


    this.sendData =function (data){
        return new Promise( function ( resolve , reject )
        {
            self.getModul( "Ajax" ).then( function ( Ajax )
            {
                // Не обрабатывать сообщения
                Ajax.ReturnRespond = true;
                // Отправить запрос
                Ajax.send( data ).then( function ( r )
                {
                    resolve(r);
                },function (err){ reject(err) });
            })
        });
    }
}
;
(function (){
    window.plgContentGoogleAnalyticsImportExport.prototype = new GNZ11();
    var a = new window.plgContentGoogleAnalyticsImportExport();
    a.Init() ;
})();



