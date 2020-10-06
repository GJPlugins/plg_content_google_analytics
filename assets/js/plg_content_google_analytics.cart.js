/***********************************************************************************************************************
 * ╔═══╗ ╔══╗ ╔═══╗ ╔════╗ ╔═══╗ ╔══╗  ╔╗╔╗╔╗ ╔═══╗ ╔══╗   ╔══╗  ╔═══╗ ╔╗╔╗ ╔═══╗ ╔╗   ╔══╗ ╔═══╗ ╔╗  ╔╗ ╔═══╗ ╔╗ ╔╗ ╔════╗
 * ║╔══╝ ║╔╗║ ║╔═╗║ ╚═╗╔═╝ ║╔══╝ ║╔═╝  ║║║║║║ ║╔══╝ ║╔╗║   ║╔╗╚╗ ║╔══╝ ║║║║ ║╔══╝ ║║   ║╔╗║ ║╔═╗║ ║║  ║║ ║╔══╝ ║╚═╝║ ╚═╗╔═╝
 * ║║╔═╗ ║╚╝║ ║╚═╝║   ║║   ║╚══╗ ║╚═╗  ║║║║║║ ║╚══╗ ║╚╝╚╗  ║║╚╗║ ║╚══╗ ║║║║ ║╚══╗ ║║   ║║║║ ║╚═╝║ ║╚╗╔╝║ ║╚══╗ ║╔╗ ║   ║║
 * ║║╚╗║ ║╔╗║ ║╔╗╔╝   ║║   ║╔══╝ ╚═╗║  ║║║║║║ ║╔══╝ ║╔═╗║  ║║─║║ ║╔══╝ ║╚╝║ ║╔══╝ ║║   ║║║║ ║╔══╝ ║╔╗╔╗║ ║╔══╝ ║║╚╗║   ║║
 * ║╚═╝║ ║║║║ ║║║║    ║║   ║╚══╗ ╔═╝║  ║╚╝╚╝║ ║╚══╗ ║╚═╝║  ║╚═╝║ ║╚══╗ ╚╗╔╝ ║╚══╗ ║╚═╗ ║╚╝║ ║║    ║║╚╝║║ ║╚══╗ ║║ ║║   ║║
 * ╚═══╝ ╚╝╚╝ ╚╝╚╝    ╚╝   ╚═══╝ ╚══╝  ╚═╝╚═╝ ╚═══╝ ╚═══╝  ╚═══╝ ╚═══╝  ╚╝  ╚═══╝ ╚══╝ ╚══╝ ╚╝    ╚╝  ╚╝ ╚═══╝ ╚╝ ╚╝   ╚╝
 *----------------------------------------------------------------------------------------------------------------------
 * @author Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
 * @date 21.09.2020 09:24
 * @copyright  Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later;
 **********************************************************************************************************************/
window.plgContentGoogleAnalyticsCart = function (){
    var $ = jQuery ;
    var self = this ;

    /*global Joomla ,  */
    this.Init = function (){
        var Options = Joomla.getOptions('plgContentGoogleAnalytics',{});
        $.extend(  true , self.settigs ,  Options   );
        siteUrl = Joomla.getOptions('GNZ11',{}).Ajax.siteUrl;

        // Настройки вех блоков текущего контекста
        var contextBlock =[];
        contextBlock.push(self.settigs.contextBlockProductsCart)  ;
        // Установка пользовательсеих блоков из настроек плагина
        self.setUserBlockSetting( contextBlock );

        // Установка обработки событий
        self._addEventListener();

        // Загрузка контейнера GTM
        self.loadGTM ();

        // 1й. Этапы оформления покупки
        self.onCheckout();

        self.InitTriggers();
        //
        self.checkDataPurchase();

    }



    /**
     * Инит триггеров корзины
     * @constructor
     */
    this.InitTriggers = function (){
        var TRIGGERS = [
            {
                'i' : 1 ,
                'name' : 'selectShipment',
                'selector' : '#bypv_cart_shipments ul li label'
            },
            {
                'i' : 2 ,
                'name' : 'selectPayment' ,
                'selector' : '#bypv_cart_payments ul li label' ,
            },

        ];

        $.each(TRIGGERS , function (i,triggerSettings){
            console.log(triggerSettings.name)
            $(document).on( triggerSettings.name , function ( event , option ){
                var step = i+2 ;
                 self.GTM_Send.onCheckoutOption(  step , option )
                console.log(self.GTM_Send)
                 console.log( step )
                 console.log(option)
            })
        });

        $.each(TRIGGERS , function (i,triggerSettings){
            jQuery(triggerSettings.selector).on('click' , function (){

                var option = 'TTTTTTTT' ;
                $(document).trigger( triggerSettings.name ,  option  )
            });
        })
    }
    /**
     * 1й. Этапы оформления покупки
     */
    this.onCheckout = function() {
        if ( typeof self.settigs.dataPurchase !== 'undefined' ) return ;
        var mySetting = self.settigs.contextBlockProductsCart ;
        // список с товарами
        var $productsList = $(mySetting.selector_products_list)
        // Товары в списке
        var $Products = $productsList.find(mySetting.selector_product);
        $Products.each(function (i,Product){
            var $Product = $(Product);
            self.addProductBlockDataInfoProcess( $Product , mySetting , 'checkout' );
            console.log( self.ProductBlockDataInfo )
        })
        self.GTM_Send.sendCheckout();
    }
    /**
     * Инициализация карточек товара в категории Растановка номеров товаров в списке
     *
     * @param $list {jQuery} список товаров
     * @param settingId {int} Id объекта настроек self.settigs.contextBlock
     * @constructor
     */
    this.InitProductCard = function ( $list , settingId){
        // Селектор для поиска товара в списке
        var selectorProduct = self.settigs.contextBlockProductsCart.selector_product
        // Добавить товарам в списках номера позиций
        this.addItemNumberProduct($list ,  selectorProduct);
    }
    /**
     * Обработка кликов по товарам Переходы в подробности о товаре
     * @param event
     */
    this.onClickInProduct = function (event){
        event.preventDefault();
        var mySetting = self.settigs.contextBlockProductsCart ;
        // Селектор для поиска товара в списке
        var selectorProduct = mySetting.selector_product;
        // Находим товар по которомы был клик
        var $Product = $(event.target).closest( selectorProduct );

        self.addProductBlockDataInfoProcess( $Product , mySetting , 'ClickInProduct' );

        var $link = $Product.find(mySetting['selector_product-click_in_product'])
        var callBackUrl = $($link[0]).attr('href') ;

        // Отправить данные - тип Клик по товару
        self.GTM_Send.sendClickInProduct( $Product , mySetting , callBackUrl);
        console.log( $link )
        console.log( callBackUrl )

    }
    /**
     * Проверить данные о созданом заказе если есть то передать для отправки
     */
    this.checkDataPurchase = function (){
        if ( typeof self.settigs.dataPurchase === 'undefined' ) return ;
        self.GTM_Send.sendPurchase( self.settigs.dataPurchase )
    };
    /**
     * Установка обработки событий
     * @private
     */
    this._addEventListener = function (){

    }



};
(function (){
    window.plgContentGoogleAnalyticsCart.prototype = new window.plgContentGoogleAnalyticsCore();
    var a = new window.plgContentGoogleAnalyticsCart();
    a.Init() ;
})();





















































