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
window.plgContentGoogleAnalyticsCore = function (){
    var $ = jQuery ;
    var self = this ;
    var siteUrl   ;
    this.settigs = {
        GTM_ID : false ,
        ver : '1.0.0' ,
        currencyCode : 'UAH' ,
        // Селекторв для товаров в корзине
        contextBlockProductsCart : {
            selector_products_list : false ,
        } ,
        // Текущий контекст [com_virtuemart.category | ]
        Context : false ,
        // Блок для хранения массива пользовательских селекторов
        contextBlock : [] ,
        // Прочие системные селекторы
        selectors : {
            // Класс для отметки обработанных карточек товаров
            stopClass : 'not-impressions' ,
        },
    };
    this.assets = {
        cart : 'plugins/content/plg_content_google_analytics/assets/js/plg_content_google_analytics.cart.js',
    };
    /**
     *
     * @constructor
     */
    this.Init = function (){

        var Options = Joomla.getOptions('plgContentGoogleAnalytics',{});
        $.extend(  true , self.settigs ,  Options   );
        siteUrl = Joomla.getOptions('GNZ11',{}).Ajax.siteUrl



        // Загрузка компонента для работы в корзине покупателя
        if ( self.settigs.is_Cart ){
            self.load.js(siteUrl + self.assets.cart + '?v=' + this.settigs.ver );
            return;
        }


        // Настройки вех блоков текущего контекста
        var contextBlock = self.settigs.contextBlock ;
        // Установка пользовательсеих блоков из настроек плагина
        this.setUserBlockSetting( contextBlock );

        // Проверка списков товаров - которые попали в зону видимости
        self.checkEcListPosition();
        // Установка обработки событий scroll Click
        self._addEventListener();
        // Загрузка контейнера GTM
        self.loadGTM ();
        // Проверить и отправить детали товара - если установлено ( Для страницы Product detail )
        self.checkEcDetail()

        return  ;
/*


        this._pagination = $(self.settigs.selectors.pagination).text().trim();

        this._category = $($(self.settigs.selectors.list)[0]).text().trim() ;

        // Перебор элементов списка товаров
        self.checkMyPosition();

        // для страницы товара
        if (self.settigs.Context === 'com_virtuemart.productdetails' ){
            self.handlerProductDetails();
        }

        // console.log( self.settigs )*/

    }
    /**
     * Проверить и отправить детали товара - если установлено
     */
    this.checkEcDetail = function (){
        var $detail = $('[data-conversions-ec-detail="1"]') ;
        if (!$detail[0]) return  ;
        // ID - настроек блока
        var settingId = $detail.attr('data-conversions-ec-context-setting');
        // Записать в массив данные о товаре перед отправкой события
        self.addProductBlockDataInfo( $detail , settingId  );
        self.GTM_Send.sendDetalProduct( $detail , settingId );

        console.log(self.ProductBlockDataInfo)
    }

    /**
     * Установка пользовательсеих блоков по селекторам из настроек плагина
     */
    this.setUserBlockSetting = function ( contextBlock ){

        if ( !contextBlock.length ) return ;
        var base = this ;

        // Перебираем блоки с настройками для текущего контекста
        $.each(contextBlock , function ( i,block ){

            // Если установлено для этого правила использовать как список
            if (block.use_as === 'list'){
                // Находим блок со спсисеом товаров
                $selector_products_list = $(block.selector_products_list) ;

                $selector_products_list
                    .attr('data-conversions-ec-list' , block.selector_products_list_name );
                // Инициализация карточек товара в списках товаров ( Для списков товаров )
                base.InitProductCard( $selector_products_list , i );
            }else{
                $selector_products_list = $( block.selector_product ) ;

                if (block.use_as === 'product_details'){
                    $selector_products_list.attr('data-conversions-ec-detail' , 1 ) ;
                }

            }

            // Установить id объекта настроек "self.settigs.contextBlock"
            $selector_products_list.attr('data-conversions-ec-context-setting' , i );

            // Оработка кликов по товару
            var click_in_product = block['selector_product-click_in_product'];
            if (click_in_product){
                $selector_products_list.find(click_in_product).on('click' , base.onClickInProduct )
            }

            // Обрабтка кликов по кнопки купить
            var click_addToCart = block['selector_product-click_add_to_cart'];
            if (typeof click_addToCart !== 'undefined'){
                $selector_products_list.find( click_addToCart ).on('click' , base.onClickAddToCart )
            }

        });
    }
    /**
     * Обработка кликов по товарам
     * @param event
     */
    this.onClickInProduct = function (event){
        event.preventDefault();
        // список с товарами
        var $list = $(event.target).closest('[data-conversions-ec-context-setting]');

        // ID - настроек блока
        var settingId = $list.attr('data-conversions-ec-context-setting');

        // Селектор для поиска товара в списке
        var selectorProduct = self.settigs.contextBlock[settingId].selector_product;

        // Находим товар по которомы был клик
        var $Products = $(event.target).closest( selectorProduct );

        // Записать в массив данные о товаре перед отправкой события
        self.addProductBlockDataInfo( $Products , settingId ,'ClickInProduct' );

        var $link = $Products.find(self.settigs.contextBlock[settingId]['selector_product-click_in_product'])
        var callBackUrl = $($link[0]).attr('href') ;

        // Отправить данные - тип Клик по товару
        self.GTM_Send.sendClickInProduct($Products , self.settigs.contextBlock[settingId] , callBackUrl);

    }
    /**
     * Обрабтка кликов по кнопки купить
     * @param event
     */
    this.onClickAddToCart = function (event){
        // список с товарами
        var $list = $(event.target).closest('[data-conversions-ec-context-setting]')
        // ID - настроек блока
        var settingId = $list.attr('data-conversions-ec-context-setting');
        // Селектор для поиска товара в списке
        var selectorProduct = self.settigs.contextBlock[settingId].selector_product ;
        // Находим товар по которомы был клик
        var $Products = $(event.target).closest( selectorProduct );
        // Записать в массив данные о товаре перед отправкой события
        self.addProductBlockDataInfo( $Products , settingId ,'addToCartProduct' );
        // Отправить данные - тип Клик по товару
        self.GTM_Send.sendClickAddToCartProduct($Products , settingId );
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
        var selectorProduct = self.settigs.contextBlock[settingId].selector_product
        // Добавить товарам в списках номера позиций
        self.addItemNumberProduct($list ,  selectorProduct);

    }
    /**
     * Добавить товарам в списках номера позиций
     * @param $list {jQuery} блок со списком товаров
     * @param selectorProduct {string} селеутор для нахождения блоков товаров
     */
    this.addItemNumberProduct = function ( $list , selectorProduct){
        // в списках находим блоки товаров и нумеруем их
        var $Products = $list.find( selectorProduct )

        $Products.each(function (i,Product){
            var $Product = $(Product)
            // Добавить товару номер в списке товаров
            $Product.attr('data-impressions-position' , i+1 );
        });
    }
    /**
     * Данные для отправки в аналитику
     * @type {*[]}
     */
    this.ProductBlockDataInfo = [];
    /**
     * Получить данные о товаре и добавить в массив для отправки в аналитику
     * @param $Product {jQuery} - объект товара в которо будем искать кнопки названия и пр.
     * @param settingId {int} - ID Объекта настроек self.settigs.contextBlock
     * @param eventGa {string}
     * @constructor
     */
    this.addProductBlockDataInfo = function ($Product , settingId, eventGa ){
        var mySetting = self.settigs.contextBlock[settingId] ;
        // Process Получить данные о товаре и добавить в массив для отправки в аналитику
        self.addProductBlockDataInfoProcess( $Product, mySetting , eventGa );
    }
    /**
     * Process Получить данные о товаре и добавить в массив для отправки в аналитику
     * @param $Product {jQuery} - объект товара в которо будем искать кнопки названия и пр.
     * @param mySetting {object}
     * @param eventGa {string}
     */
    this.addProductBlockDataInfoProcess = function ( $Product , mySetting , eventGa ){
        var pId = self.getTextElement( $Product.find( mySetting['selector_product-id'] ) );
        var pName = self.getTextElement( $Product.find( mySetting['selector_product-name'] ) );
        var pPrice = self.getTextElement( $Product.find( mySetting['selector_product-price'] ) )
            .replace(/[^\d,;]/g, '')
            .replace(/,/g, '.').trim();

        // Поиск названия бренда если не указан === Brand
        var pBrand = 'Brand'
        var $brand = $Product.find( mySetting['selector_product-brand'] );
        if ($brand[0]){
            pBrand = self.getTextElement( $brand );
        }

        // Поиск названия категориии
        var pCategory = false ;
        if ( mySetting['selector_product-category'] ){
            // Если неазвание категории нет в карточке товара то ищем на страницы
            var $categoryEl =  $Product.find( mySetting['selector_product-category'] );
            if (!$categoryEl[0]) $categoryEl = $(mySetting['selector_product-category']);
            pCategory = self.getTextElement( $categoryEl );
        }

        var DATA = {
            id : pId ,
            name : pName ,
            price : pPrice ,
            brand : pBrand ,
        }
        if (pCategory){
            DATA.category = pCategory ;
        }

        // Если список добавим позицию
        var position = $Product.attr('data-impressions-position');
        if (position && eventGa !== 'checkout') DATA.position = position ;

        switch (eventGa){
            case 'Impressions':
                DATA.list = mySetting.selector_products_list_name ;
                break;
            case 'addToCartProduct' :
            case 'checkout' :
                DATA.quantity = $Product.find(mySetting['selector_product-click_add_to_cart_quantity_input']).val();
                break;
        }
        /*if ( eventGa === 'Impressions' ){
            DATA.list = mySetting.selector_products_list_name ;
        }
        if ( eventGa === 'addToCartProduct' ){
            DATA.quantity = $Product.find(mySetting['selector_product-click_add_to_cart_quantity_input']).val();
        }*/

        console.log(eventGa)

        self.ProductBlockDataInfo.push( DATA );
    }
    /**
     * Получить значение текста елемента Если это Input return value
     * @param $el
     * @returns {*|Promise<string>|string|jQuery}
     */
    this.getTextElement = function ($el){
        var tagName = $($el).get (0).tagName;
        // console.log(tagName)
        switch (tagName) {
            case 'META' :
                return $($el).attr('content').trim();
            case 'INPUT' :
                return $($el).val().trim();
            default:
                return $($el).text().trim();
        }
    }

    this.dataConversions={
        /**
         * Получить все елементы из списка продуктов
         * @param  {jQuery} $listElement Елемент список
         * @returns {*|jQuery|HTMLElement}
         */
        getListItems : function ($listElement){
            var ContextSetting = self.settigs.contextBlock ;
            var _sel = '[data-conversions-ec-product]'
            // если у списка есть настройки
            if (typeof $listElement.attr('data-conversions-ec-context-setting') !== 'undefined' ){
                // получить ID настроек в ContextSetting
                var _listId = $listElement.attr('data-conversions-ec-context-setting');
                _sel = ContextSetting[_listId]['selector_product']  ;
            }
            return $(_sel) ;
        },
    };

    /**
     * Установка обработки событий
     * @private
     */
    this._addEventListener = function (){

        // Проверка списков товаров - которые попали в зону видимости при скролле
        $(document).on('scroll.impressions-list' ,self.checkEcListPosition);



        // $(document).on('scroll.impressions' ,self.checkMyPosition);

        // Проверка при масштабировании и изменении размера страницы
        // $(window).on('resize.impressions',self.checkMyPosition);

        //Обработка клика по товару
        $(self.settigs.selectors.clickProducts).on('click' , self.handlerClick);

        $(self.settigs.selectors.addtocart).on('click' , self.handlerClickAddTocart )
    }
    /**
     * Проверка списков товаров - которые попали в зону видимости при скролле
     * Крутим  списки с товарами и товары в них
     * Если находим видимый товар то добавляем списку класс-индикатор слежение за скроллом
     *
     */
    this.checkEcListPosition = function (){
        var $ecList = $('[data-conversions-ec-list]:not(.checkPosition-list-Active)').not( '.'+self.settigs.selectors.stopClass )
        // Перебераем списки товаров
        $ecList.each(function (i,a){
            var $listItems = self.dataConversions.getListItems( $(a) );
            $listItems.each(function ( idItemsEl , ItemsEl  ){
                var $ItemsEl = $(ItemsEl)

                // Если элемент списка видемый
                if (self.checkPosition( $ItemsEl )){
                    // даем списку товаров класс активного списка
                    // и начинаем следить за видемостью товаров в нем
                    $ItemsEl.closest('[data-conversions-ec-list]').addClass('checkPosition-list-Active')
                }
            })
        });
        // Проверка в активных списках видемых товаров
        self.checkEcProductPosition();
    }
    /**
     * Проверка в активных списках видемых товаров
     */
    this.checkEcProductPosition = function (){
        var settingId
        //Получить Все товары в активных списках
        var $allProductInList = self.dataConversions.getListItems( $('.checkPosition-list-Active') );
        $allProductInList.each(function (i,a){
            var $product = $(a);
            // Если товара видемый и не имеет стоп класс (не обрабатывался)
            if ( self.checkPosition( $product ) && !$product.hasClass( self.settigs.selectors.stopClass )  ){
                $product.addClass( self.settigs.selectors.stopClass )
                settingId = $product.closest('.checkPosition-list-Active').attr('data-conversions-ec-context-setting')
                self.addProductBlockDataInfo( $product , settingId , 'Impressions' )

            }
        });
        self.GTM_Send.sendImpressions();
    }


    /**
     * Отправление  данных в GTM
     * @type {{sendImpressions: (function(): (undefined))}}
     */
    self.GTM_Send = {
        /**
         * Покупки -
         * @param data
         * @see https://developers.google.com/tag-manager/enhanced-ecommerce#purchases
         */
        sendPurchase : function (data){
            dataLayer.push({
                'ecommerce': {
                    'purchase': {
                        'actionField': data.actionField ,
                        'products': data.products
                    }
                },
                'event': 'purchase',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-non-interaction': 'False',
            });
        },
        /**
         * Данные о параметрах покупки Шаги оформления заказа
         * @param step {int} - номер  шага
         * @param checkoutOption - дополнительная информация
         * @see {url} https://developers.google.com/tag-manager/enhanced-ecommerce#checkout_option
         */
        onCheckoutOption: function (step, checkoutOption) {
            dataLayer.push({
                'ecommerce': {
                    'checkout': {
                        'actionField': {'step': step, 'option': checkoutOption }
                    }
                },
                'event': 'checkout',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-non-interaction': 'False',
            });
            /*dataLayer.push({
                // 'event': 'checkoutOption',
                'ecommerce': {
                    'checkout_option': {
                        'actionField': {'step': step, 'option': checkoutOption}
                    }
                },
                'event': 'checkout_option',
                // 'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                // 'gtm-ee-event-action': 'checkout',
                'gtm-ee-event-non-interaction': 'False',
            });*/
        },
        /**
         * При первом попадании в корзину
         */
        sendCheckout : function (){
            dataLayer.push({
                'ecommerce': {
                    'checkout': {
                        'actionField': {'step': 1, },
                        'products':  self.ProductBlockDataInfo
                    }
                },
                'event': 'checkout',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-non-interaction': 'False',
                'eventCallback': function() {
                    self.ProductBlockDataInfo = [];
                }
            });
        },
        /**
         * Отправить данные о деталях товара со страницы продукта
         * @param $Products {jQuery} - объект товара
         * @param settingId {int} - Id объекта настроек
         */
        sendDetalProduct : function ( $Products , settingId ){
            dataLayer.push({
                'ecommerce': {
                    'detail': {
                        // 'actionField': {'list': 'Apparel Gallery'},    // 'detail' actions have an optional list property.
                        'products': self.ProductBlockDataInfo
                    }
                },
                'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-action': 'productClick',
                'gtm-ee-event-non-interaction': 'True',
                'eventCallback': function() {
                    self.ProductBlockDataInfo = [];
                }
            });
        },
        /**
         * Нажатие на кнопку купить Отправить событие
         * @param $Products {jQuery} - объект товара
         * @param settingId {int} - Id объекта настроек
         */
        sendClickAddToCartProduct : function ( $Products , settingId){
            dataLayer.push({
                // 'event': 'addToCart',
                'ecommerce': {
                    'currencyCode': self.settigs.currencyCode,
                    'add':  {
                        'actionField': {
                            'list': self.settigs.contextBlock[settingId].selector_products_list_name
                        },
                        'products' : self.ProductBlockDataInfo
                    }
                },
                'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-action': 'addToCart',
                'gtm-ee-event-non-interaction': 'False',
                'eventCallback': function() {
                    self.ProductBlockDataInfo = [];
                }
            });
        },
        /**
         * Отправить данные - тип Клик по товару
         * @param $Products {jQuery} - объект товара
         * @param mySetting {object} - объект блока настроек
         * @param callBackUrl   {string} - Url для переадресации
         */
        sendClickInProduct : function ($Products , mySetting , callBackUrl){
            if (!self.ProductBlockDataInfo.length) return ;

            dataLayer.push({
                'ecommerce': {
                    'currencyCode': self.settigs.currencyCode ,
                    'click': {
                        'actionField': {
                            'list': mySetting.selector_products_list_name
                        },
                        'products' : self.ProductBlockDataInfo
                    },
                },
                'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-action': 'Click',
                'gtm-ee-event-non-interaction': 'False',
                'eventCallback': function() {
                    self.ProductBlockDataInfo = [];
                    window.location.href = callBackUrl ;
                }
            });
        },
        /**
         * Отправить данные - тип Эффективность списка
         */
        sendImpressions : function (){
            // // {{GTM EE Event Action}}
            if (!self.ProductBlockDataInfo.length) return ;
            dataLayer.push({

                'ecommerce': {
                    'currencyCode': 'UAH',
                    'impressions': self.ProductBlockDataInfo,
                },
                'event': 'impressions',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-non-interaction': 'True',
                'eventCallback': function() {
                    self.ProductBlockDataInfo = [];
                }
            });

        },
    }




    /**
     * Перебор элементов списка товаров
     * если  товар - в зоне видемости - добавляем в  DataLayer
     */
    this.checkMyPosition =function (){
        console.log('Start Method - checkMyPosition')
        var $elements = $( self.settigs.selectors.productCard ).not( '.'+self.settigs.selectors.stopClass );
        // Если элементов нет то удуляем обработчик слижения за скролои
        if (!$elements[0]) self._removeEventListener();
        $.each($elements , function ( i , a ){
            var $elem = $(a) ;
            // Если товара в зоне видиости
            if ( self.checkPosition( $elem ) ) {
                $elem.addClass(self.settigs.selectors.stopClass);
                self.addProductToImpressions( $elem );
            }
        });
        if ( self.ecomImpressions.ecommerce.impressions.length ){
            self.sendDataLayer('Impressions');
        }

    };
    /**
     * Добавить товар в массив Impressions для отправки эффективности списков
     * @param $element
     */
    this.addProductToImpressions = function ($element){
        console.log('Start Method - addProductToImpressions эффективности списков')
        var tempObj  = self.getProduct($element);
        tempObj.list = $element.closest('[data-conversions-ec-list]').attr('data-conversions-ec-list') ;
        self.ecomImpressions.ecommerce.impressions.push(tempObj);
    }
    /**
     * Получить данные о товаре в категории
     * @param $element
     * @returns {{price: jQuery, name: jQuery, id: jQuery, position: jQuery, category: *, list: *, brand: string}}
     */
    this.getProduct = function ($element){
        console.log('Start Method - getProduct Получить данные о товаре в категории')
        var tempObj = {
            'id': $($element).find(self.settigs.selectors.productId).val(),
            'name': $($element).find(self.settigs.selectors.name).text(),

            'price':  $($element).find(self.settigs.selectors.price).text()
                .replace(/[^\d,;]/g, '')
                .replace(/,/g, '.').trim(),
            'brand': 'Brand ',
            'category': this._category ,
            // 'variant': 'Variant 1',
            'list': self._getList() ,
            'position': $($element).attr('ImpressionsPosition'),
        };
        return tempObj ;
    }
    /**
     * Обработка клика по товару
     * @param event
     */
    this.handlerClick = function (event){
        event.preventDefault();
        var link = $(this).attr('href');
        var $parentBlock = $(this).closest(self.settigs.selectors.productCard);
        var productData = self.getProduct($parentBlock);
        self.ecomImpressions.ecommerce.click = {
            'actionField': {'list': self._getList() },
            'products' : [] ,
        }
        // self.ecomImpressions.ecommerce.click = clickData ;
        self.ecomImpressions.ecommerce.click.products.push(productData) ;
        self.ecomImpressions.eventCallback =  window.location.href = link;
        self.sendDataLayer('Clicks');
        console.log( self.ecomImpressions )
        setTimeout(function (){
            // window.location.href = link ;
        },500);
    }
    /**
     * Показ Страницы с информацией о товаре
     * context = com_virtuemart.productdetails
     */
    this.handlerProductDetails = function (){
        var $elem = $( self.settigs.selectors.productCard )
        var productData = self.getProduct($elem);
        self.ecomImpressions.ecommerce.detail = {
            'actionField': {'list': self._getList() },
            'products' : [] ,
        }
        self.ecomImpressions.ecommerce.detail.products.push(productData) ;
        self.sendDataLayer('Details');
        console.log( productData  )
    }
    /**
     * Обработка кнопки купить
     */
    this.handlerClickAddTocart = function (event){
        // event.preventDefault();
        var $parentBlock = $(this).closest(self.settigs.selectors.productCard);
        var productData = self.getProduct($parentBlock);
        productData.quantity = +$parentBlock.find( self.settigs.selectors.quantity ).val();
        productData.category =  self._getList() ;


        var _list = self._getList();
        if (self.settigs.Context === 'com_virtuemart.productdetails') _list = 'ProductDetails';
        productData.list =  _list ;

        self.ecomImpressions.ecommerce.add = {
            'products' : [] ,
        }
        self.ecomImpressions.ecommerce.add.products.push(productData) ;

        dataLayer.push({
            'ecommerce': {
                'currencyCode': 'UAH',
                'add': {                                // 'add' actionFieldObject measures.
                    'products': [
                        productData
                        /*{                        //  adding a product to a shopping cart.
                        'name': 'XXX - Triblend Android T-Shirt',
                        'id': '12345',
                        'price': '15.25',
                        'brand': 'Google',
                        'category': 'Apparel',
                        'variant': 'Gray',
                        'quantity': 1
                    }*/]
                }
            },
            'event': 'gtm-ee-event',
            'gtm-ee-event-category': 'Enhanced Ecommerce',
            'gtm-ee-event-action': 'addToCart',
            // 'gtm-ee-event-non-interaction': 'True',
            'gtm-ee-event-non-interaction': 'False',
        });


          // self.sendDataLayer('addToCart');
        console.log(productData)

    }



    /**
     * Удалить обработчики событий - scroll.impressions && resize.impressions
     * @private
     */
    this._removeEventListener = function (){
        $(document).off('scroll.impressions'  );
        $(window).off('resize.impressions');
    }
    /**
     * Получить информацию о странице на которой произошло событие
     * @returns {string}
     * @private
     */
    this._getList = function (){
        return this._category + (self._pagination.length ? '-'+  self._pagination : '' ) ;
    }
    /**
     * Загрузка контейнера GTM
     */
    this.loadGTM = function (){
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',self.settigs.GTM_ID);
    }

    /**
     * Проверка полной видимости элемента
     * @param  $element
     */
    this.checkPosition = function ( $element  ){



        // координаты дива
        var div_position = $element.offset();
        // отступ сверху
        var div_top = div_position.top;
        // отступ слева
        var div_left = div_position.left;
        // ширина
        var div_width = $element.width();
        // высота
        var div_height = $element.height();

        // проскроллено сверху
        var top_scroll = $(document).scrollTop();
        // проскроллено слева
        var left_scroll = $(document).scrollLeft();
        // ширина видимой страницы
        var screen_width = $(window).width();
        // высота видимой страницы
        var screen_height = $(window).height();

        // координаты углов видимой области
        var see_x1 = left_scroll;
        var see_x2 = screen_width + left_scroll;
        var see_y1 = top_scroll;
        var see_y2 = screen_height + top_scroll;

        // координаты углов искомого элемента
        var div_x1 = div_left;
        var div_x2 = div_left + div_height;
        var div_y1 = div_top;
        var div_y2 = div_top + div_width;

        // проверка - виден див полностью или нет
        if( div_x1 >= see_x1 && div_x2 <= see_x2 && div_y1 >= see_y1 && div_y2 <= see_y2 ){

            // если виден
            return true;
            // $element.css({'background-color': 'green'});
        }else{
            // если не виден
            return false;
            // $element.css({'background-color': 'red'});
        }
    }

};



(function (){
    window.plgContentGoogleAnalyticsCore.prototype = new GNZ11();
    var a = new window.plgContentGoogleAnalyticsCore();
    a.Init() ;
})();
