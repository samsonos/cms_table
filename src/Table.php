<?php
namespace samson\cms\table;

use samson\activerecord\dbQuery;
use samson\pager\Pager;

/**
 * Class for rendering SamsonCMS table
 * @author Vitaly Iegorov <egorov@samsonos.com>
 */
class Table implements \samson\core\iModuleViewable
{
    /**
     * Pagination object
     * @var Pager
     */
    public $pager;

    /**
     * Query object
     * @var dbQuery
     */
    public $query;

    /** Flag for outputting debug information */
    public $debug = false;

    /** Default table template file */
    public $table_tmpl = 'table/tmpl';

    /** Default table row template */
    public $row_tmpl = 'table/row/index';

    /** Default table empty row template */
    public $empty_tmpl = 'table/row/empty';

    /** Quantity of last table rendererd rows */
    public $last_render_count = 0;


    /**
     * Constructor
     * @param dbQuery 	$query	Query object
     * @param Pager 	$pager	Pagination object
     */
    public function __construct( dbQuery & $query, Pager & $pager = null )
    {
        $this->query = $query;
        $this->pager = $pager;//!isset($pager) ? new Pager( 1, 10 ) :

        // Add default query handler for pagination
        if( isset($this->pager) ) $this->query->handler( array($this,'pagination') );

        $this->beforeHandler();
    }

    /**
     * Query handler after making pagination
     * @return dbQuery
     */
    public function beforeHandler()
    {
        return $this->query;
    }

    /**
     * Generic SamsonCMS table pagination handler
     * @param dbQuery 	$query	Query object
     * @param Pager 	$pager	Pagination object
     */
    public function pagination( dbQuery & $query )
    {
        // If pager is passed
        if ( isset( $this->pager ))
        {
            // Clone query for count request
            $count_query = clone $query;

            $this->pager->update( $count_query->innerCount() );

            //elapsed('pagination'.$this->pager->total);

            // Set originl query limit
            $query->limit( $this->pager->start, $this->pager->end, true );
        }
    }

    /**
     * Generic SamsonCMS table row renderer
     * @param Object 	$db_row DB Row object
     * @param Pager 	$pager	Pagination object
     * * @param string 	$module	Current module name
     * @return string HTML SamsonCMS table row
     */
    public function row(& $db_row, Pager & $pager = null, $module = null)
    {
        return m($module)->set($db_row)->set($pager)->output($this->row_tmpl);
    }

    /**
     * Generic SamsonCMS table empty row renderer
     * @param dbQuery 	$query	Query object
     * @param Pager 	$pager	Pagination object
     * @param string 	$module	Current module name	 
     * @return string Empty HTML SamsonCMS table row
     */
    public function emptyrow( dbQuery & $query, Pager & $pager = null, $module = null)
    {
        return m($module)->view($this->empty_tmpl)->output();
    }

    /** Ability to pass object to module view */
    function toView( $prefix = NULL, array $restricted = array() )
    {
        return array( $prefix.'html' => $this->render() );
    }

    /**
     * Universal SamsonCMS table render
     * @return string HTML SamsonCMS table
     */
    public function render( array $db_rows = null, $module = null)
    {
        // Rows HTML
        $rows = '';

        // if no rows data is passed - perform db request
        if( !isset($db_rows) )	$db_rows = $this->query->exec();

        // If we have table rows data
        if( is_array($db_rows ) && sizeof($db_rows) )
        {
            // Save quantity of rendering rows
            $this->last_render_count = sizeof($db_rows);

            // Debug info
            $rn = 0;
            $rc = sizeof($db_rows);

            // Iterate db data and perform rendering
            foreach( $db_rows as & $db_row )
            {
                if($this->debug ) elapsed('Rendering row '.$rn++.' of '.$rc.'(#'.$db_row->id.')');
                $rows .= $this->row( $db_row, $this->pager );
                //catch(\Exception $e){ return e('Error rendering row#'.$rn.' of '.$rc.'(#'.$db_row->id.')'); }
            }
        }
        // No data found after query, external render specified
        else $rows .= $this->emptyrow($this->query, $this->pager, $module);

        //elapsed('render pages: '.$this->pager->total);

        // Render table view
        return m($module)
            ->view( $this->table_tmpl )
            ->set( $this->pager )
            ->rows( $rows )
        ->output();
    }
}