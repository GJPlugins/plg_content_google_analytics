<?php
/**
 * @package    plg_content_google_analytics
 *
 * @author     oleg <your@email.com>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       http://your.url.com
 */

defined('_JEXEC') or die;


use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Registry\Registry;

/**
 * Plg_content_google_analytics plugin.
 *
 * @package   plg_content_google_analytics
 * @since     1.0.0
 */
class plgContentPlg_content_google_analytics extends CMSPlugin
{
    /**
     * @var string id плагина
     * @since 3.9
     */
    public static $_id ;
    /**
     * @var string группа плагина
     * @since 3.9
     */
//    public  static $_type;
	/**
	 * Application object
	 *
	 * @var    CMSApplication
	 * @since  1.0.0
	 */
	protected $app;

	/**
	 * Database object
	 *
	 * @var    JDatabaseDriver
	 * @since  1.0.0
	 */
	protected $db;

	/**
	 * Affects constructor behavior. If true, language files will be loaded automatically.
	 *
	 * @var    boolean
	 * @since  1.0.0
	 */
	protected $autoloadLanguage = true;


	protected $contextArr = [
	    'com_virtuemart.category' ,
	    'com_virtuemart.productdetails',
	    'com_virtuemart.vendor',
    ] ;

	protected $patchGnz11 = JPATH_LIBRARIES . '/GNZ11';

    /**
     * Constructor.
     *
     * @param   object  &$subject  The object to observe
     * @param   array   $config    An optional associative array of configuration settings.
     *
     * @since   3.7.0
     */
    public function __construct(&$subject, $config)
    {
        parent::__construct($subject, $config);
        $this->app = \Joomla\CMS\Factory::getApplication();
        self::$_id = $config['id'] ;



//        $this->votingPosition = $this->params->get('position', 'top');
    }

    public function onContentPrepare($context, &$row, &$params, $page = 0)
    {
        return  true ;
        
    }

    /**
     * Событие для Virtuemart заказ создан
     * @param $cart
     * @param $order
     * @since 3.9
     * @auhtor Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
     * @date 29.09.2020 22:26
     *
     */
    function plgVmConfirmedOrder($cart, $order)
    {
        $session = \Joomla\CMS\Factory::getSession();
        $modelVendor = VmModel::getModel ('vendor');
        $modelProduct = VmModel::getModel ('product');
        $vendor = $modelVendor->getVendor();

        $dataPurchase = [] ;

        // Тест - Техническое и офисное освещение
        $dataPurchase['actionField']['id'] = $order["details"]["BT"]->order_number ;
        $dataPurchase['actionField']['transactionId'] = $order["details"]["BT"]->order_number ;

        $dataPurchase['actionField']['affiliation'] = $vendor->vendor_store_name ;
        $dataPurchase['actionField']['revenue'] = $order["details"]["BT"]->order_total ;
        $dataPurchase['actionField']['revenue'] = $order["details"]["BT"]->order_total ;
        $dataPurchase['actionField']['tax'] = $order["details"]["BT"]->order_tax ;
        $dataPurchase['actionField']['shipping'] = $order["details"]["BT"]->order_shipment ;
        $dataPurchase['actionField']['coupon'] = '' ;

        $dataPurchase['products'] = [] ;

        foreach ( $order["items"]   as  $i => $product ){

            $category = $modelProduct->getProductCategories($product->virtuemart_product_id);

            $items['name'] = $product->order_item_name ;
            $items['id'] = $product->virtuemart_product_id ;
            $items['price'] = $product->product_final_price ;
            $items['brand'] = 'Brand' ;
            $items['category'] = $category[0]['category_name'] ;
            $items['brand'] = 'Brand' ;
            $items['variant'] = 'Variant' ;
            $items['quantity'] = $product->product_quantity ;
            $items['coupon'] = '' ;
            $dataPurchase['products'][] = $items ;

        }#END FOREACH

        # Сохраняем даннае в сессию для сохранения при переадресации
        $session->set('dataPurchase', $dataPurchase , 'plgContentGoogleAnalytics'  ) ;
    }

    /**
     * Displays the voting area when viewing an article and the voting section is displayed after the article
     *
     * @param   string   $context  The context of the content being passed to the plugin
     * @param   object   &$row     The article object
     * @param   object   &$params  The article params
     * @param   integer  $page     The 'page' number
     *
     * @return  array  HTML string containing code for the votes if in com_content else boolean false
     *
     * @since   3.7.0
     */
    public function onContentAfterDisplay($context, &$row, &$params, $page = 0)
    {

        if ( !in_array( $context , $this->contextArr )) return  ; #END IF

        $doc = \Joomla\CMS\Factory::getDocument();
        $session = \Joomla\CMS\Factory::getSession();


        /**
         * Проверяем данные о заказе
         */
        $dataPurchase = $session->get('dataPurchase' , null , 'plgContentGoogleAnalytics' ) ;
        if ( $dataPurchase )
        {
            $SettingsJS['dataPurchase'] = $dataPurchase ;
            $doc->addScriptOptions('plgContentGoogleAnalytics' , $SettingsJS , true ) ;
            $session->clear('dataPurchase' , 'plgContentGoogleAnalytics' );
        }#END IF







        /**
         * Загрузка ядра JS !!!!
         */
        try
        {
            JLoader::registerNamespace( 'GNZ11' , JPATH_LIBRARIES . '/GNZ11' , $reset = false , $prepend = false , $type = 'psr4' );
            $GNZ11_js =  \GNZ11\Core\Js::instance();
        }
        catch( Exception $e )
        {
            if( !\Joomla\CMS\Filesystem\Folder::exists( $this->patchGnz11 ) && $this->app->isClient('administrator') )
            {
                $this->app->enqueueMessage('Должна быть установлена бибиотека GNZ11' , 'error');
            }#END IF
            throw new \Exception('Должна быть установлена бибиотека GNZ11' , 400 ) ;
        }







        $Jpro = $doc->getScriptOptions('Jpro') ;
        $Jpro['load'][] = [
            'u' => '/plugins/content/plg_content_google_analytics/assets/js/plg_content_google_analytics.core.js?v='.$this->params->get('version_plugin' , '1.0.0' ) , // Путь к файлу
            't' => 'js' ,                                       // Тип загружаемого ресурса
        ];
        $doc->addScriptOptions('Jpro' , $Jpro ) ;
        $doc->addScriptDeclaration('window.dataLayer = window.dataLayer || [];');

        if ( $this->params->get('on_context_view' , false ) )
        {
            echo'<pre>';print_r( $context );echo'</pre>'.__FILE__.' '.__LINE__;
        }#END IF

        # Настройки блоков страницы
        $block = $this->params->get('field-block' , [] );
        $contextBlock=[];
        foreach ( $block as $item)
        {
            if ($item->context_on != $context ) continue ; #END IF
            $contextBlock[] = $item ;
        }#END FOREACH


        $contextBlockCart = $this->params->get('field-cart-product-selectors' , false )->{'field-cart-product-selectors0'} ;
        $is_Cart = $this->params->get('cart_context' , false) == $context ;

        $SettingsJS = [
            # ID Контейнера GTM
            'GTM_ID'=> $this->params->get('gtm_container_id' , false ) ,
            'ver'=> $this->params->get('version_plugin' , '1.0.0' )  ,
            # Код Валюты
            'currencyCode'=> $this->params->get('currencyCode' , 'UAH' ) ,
            'is_Cart' => $is_Cart,
            'contextBlockProductsCart' => ($is_Cart?$contextBlockCart:null) ,
            'Context' => $context ,
            'contextBlock' => $contextBlock ,
        ];

        $doc->addScriptOptions('plgContentGoogleAnalytics' , $SettingsJS , true ) ;
        return [];

    }

	/**
	 * onAfterInitialise.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterInitialise()
	{

	}

	/**
	 * onAfterRoute.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterRoute()
	{

	}

	/**
	 * onAfterDispatch.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterDispatch()
	{

	}

	/**
	 * onAfterRender.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterRender()
	{
		// Access to plugin parameters
		$sample = $this->params->get('sample', '42');
	}

	/**
	 * onAfterCompileHead.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterCompileHead()
	{

	}

	/**
	 * OnAfterCompress.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterCompress()
	{

	}

	/**
	 * onAfterRespond.
	 *
	 * @return  void
	 *
	 * @since   1.0
	 */
	public function onAfterRespond()
	{

	}

    /**
     * Ajax - точка входа
     * @since 3.9
     * @auhtor Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
     * @date 03.10.2020 23:37
     *
     */
    public function onAjaxPlg_content_google_analytics ()
    {
        $task = $this->app->input->get( 'task', null, 'STRING' );
        $result = $this->{$task}();
        echo new JResponseJson($result);
        die();
    }

    /**
     * Установка настроек
     * @since 3.9
     * @auhtor Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
     * @date 03.10.2020 23:37
     *
     */
    public function ImportSetting(){

	    $dataSetting = $this->app->input->get('Settings' , false , 'RAW' ) ;

	    $Registry = new Registry($dataSetting);
        $arr = $Registry->toObject();
        if ( !isset( $arr->version_plugin ) )
        {
            $html = $this->loadTemplate('import-error');
            echo new JResponseJson( ['html' => $html] ,  false ,true );
            die();
        }#END IF

        $object = new stdClass();

        // Должно быть допустимое значение первичного ключа.
        $object->extension_id = self::$_id;
        $object->params = $dataSetting ;
        // Update their details in the users table using id as the primary key.
        $result = \Joomla\CMS\Factory::getDbo()->updateObject('#__extensions', $object, 'extension_id');
        if ( $result )
        {
            $html = $this->loadTemplate('import-success');
            return [
                'html' => $html ,
            ] ;
        }#END IF
    }
    /**
     * Создать форму для импорта
     * @return string[]
     * @since 3.9
     * @auhtor Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
     * @date 03.10.2020 23:00
     *
     */
    public function getImportForm(){
        $html = $this->loadTemplate('import-form');
        return [
            'html' => $html ,
        ] ;
    }

    /**
     * Выгрузка караметров настроек
     * @return array
     * @since 3.9
     * @auhtor Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
     * @date 03.10.2020 22:53
     *
     */
    public function ExportSetting(){
        $this->dataSetting = $this->params->toString();
        $html = $this->loadTemplate('export-form');
        return [
            'html' => $html ,
            'params' => $this->dataSetting ,
        ] ;

    }
    /**
     * Загрузите файл макета плагина. Эти файлы могут быть переопределены с помощью стандартного Joomla! Шаблон
     *
     * Переопределение :
     *                  JPATH_THEMES . /html/plg_{TYPE}_{NAME}/{$layout}.php
     *                  JPATH_PLUGINS . /{TYPE}/{NAME}/tmpl/{$layout}.php
     *                  or default : JPATH_PLUGINS . /{TYPE}/{NAME}/tmpl/default.php
     *
     *
     * переопределяет. Load a plugin layout file. These files can be overridden with standard Joomla! template
     * overrides.
     *
     * @param string $layout The layout file to load
     * @param array  $params An array passed verbatim to the layout file as the `$params` variable
     *
     * @return  string  The rendered contents of the file
     *
     * @since   5.4.1
     */
    public function loadTemplate ( $layout = 'default' )
    {
        $path = \Joomla\CMS\Plugin\PluginHelper::getLayoutPath(  $this->get('_type') , $this->get('_name')   , $layout );
        // Render the layout
        ob_start();
        include $path;
        return ob_get_clean();
    }


}















