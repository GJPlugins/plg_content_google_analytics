<?php
/***********************************************************************************************************************
 * ╔═══╗ ╔══╗ ╔═══╗ ╔════╗ ╔═══╗ ╔══╗  ╔╗╔╗╔╗ ╔═══╗ ╔══╗   ╔══╗  ╔═══╗ ╔╗╔╗ ╔═══╗ ╔╗   ╔══╗ ╔═══╗ ╔╗  ╔╗ ╔═══╗ ╔╗ ╔╗ ╔════╗
 * ║╔══╝ ║╔╗║ ║╔═╗║ ╚═╗╔═╝ ║╔══╝ ║╔═╝  ║║║║║║ ║╔══╝ ║╔╗║   ║╔╗╚╗ ║╔══╝ ║║║║ ║╔══╝ ║║   ║╔╗║ ║╔═╗║ ║║  ║║ ║╔══╝ ║╚═╝║ ╚═╗╔═╝
 * ║║╔═╗ ║╚╝║ ║╚═╝║   ║║   ║╚══╗ ║╚═╗  ║║║║║║ ║╚══╗ ║╚╝╚╗  ║║╚╗║ ║╚══╗ ║║║║ ║╚══╗ ║║   ║║║║ ║╚═╝║ ║╚╗╔╝║ ║╚══╗ ║╔╗ ║   ║║
 * ║║╚╗║ ║╔╗║ ║╔╗╔╝   ║║   ║╔══╝ ╚═╗║  ║║║║║║ ║╔══╝ ║╔═╗║  ║║─║║ ║╔══╝ ║╚╝║ ║╔══╝ ║║   ║║║║ ║╔══╝ ║╔╗╔╗║ ║╔══╝ ║║╚╗║   ║║
 * ║╚═╝║ ║║║║ ║║║║    ║║   ║╚══╗ ╔═╝║  ║╚╝╚╝║ ║╚══╗ ║╚═╝║  ║╚═╝║ ║╚══╗ ╚╗╔╝ ║╚══╗ ║╚═╗ ║╚╝║ ║║    ║║╚╝║║ ║╚══╗ ║║ ║║   ║║
 * ╚═══╝ ╚╝╚╝ ╚╝╚╝    ╚╝   ╚═══╝ ╚══╝  ╚═╝╚═╝ ╚═══╝ ╚═══╝  ╚═══╝ ╚═══╝  ╚╝  ╚═══╝ ╚══╝ ╚══╝ ╚╝    ╚╝  ╚╝ ╚═══╝ ╚╝ ╚╝   ╚╝
 *----------------------------------------------------------------------------------------------------------------------
 * @author Gartes | sad.net79@gmail.com | Skype : agroparknew | Telegram : @gartes
 * @date 03.10.2020 20:04
 * @copyright  Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later;
 **********************************************************************************************************************/
defined('_JEXEC') or die; // No direct access to this file
jimport('joomla.form.formfield');

// The class name must always be the same as the filename (in camel case)
class JFormFieldToolbar extends JFormField {

    //The field class must know its own type through the variable $type.
    protected $type = 'toolbar';

    protected $patchGnz11 = JPATH_LIBRARIES . '/GNZ11';

    public function getLabel() {
        // code that returns HTML that will be shown as the label
    }

    public function getInput() {
        $doc = \Joomla\CMS\Factory::getDocument();

        $xml_file = JPATH_ROOT .  $this->element['path_xml'] ;

        $dom = new DOMDocument("1.0", "utf-8");
        $dom->load($xml_file);
        $version = $dom->getElementsByTagName('version')->item(0)->textContent;


//        echo'<pre>';print_r( $this->element['load_js'] );echo'</pre>'.__FILE__.' '.__LINE__;
//        echo'<pre>';print_r( $version );echo'</pre>'.__FILE__.' '.__LINE__;
//        die(__FILE__ .' '. __LINE__ );

        
        /**
         * Индивидуальная кнопка
         */
        \Joomla\CMS\Toolbar\ToolbarHelper::divider();
        $bar = JToolBar::getInstance('toolbar'); //ссылка на объект JToolBar

        $title = JText::_('Import setting'); //Надпись на кнопке
        $dhtml = "<a href=\"index.php\" class=\"btn btn-small ImportStart\">
					<i class=\"icon-upload\" title=\"$title\"></i>$title</a>"; //HTML кнопки
        $bar->appendButton('Custom', $dhtml, 'list');//давляем ее на тулбар



        $title = JText::_('Export setting'); //Надпись на кнопке
        $dhtml = "<a href=\"index.php\" class=\"btn btn-small ExportStart\">
					<i class=\"icon-download\" title=\"$title\"></i>$title</a>"; //HTML кнопки
        $bar->appendButton('Custom', $dhtml, 'list');//давляем ее на тулбар

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
            'u' => \Joomla\CMS\Uri\Uri::root() . $this->element['load_js'] . '?v=' . $version , // Путь к файлу
            't' => 'js' ,                                       // Тип загружаемого ресурса
        ];
        $doc->addScriptOptions('Jpro' , $Jpro ) ;

    }



}
