/** Pager initing routine */
var Pager = function()
{	
	// Pointer 
	var o = this;	
	
	/** Pager initialization */
	this.handlers = [];
	
	/** Add pager handler */
	this.setHandler = function( handler )
	{		
		// Add pager init handler to stack
		if( handler ) o.handlers.push( handler );	
	};
	
	/** Pager initialization */
	this.init = function()
	{			
		// Show loader with text
		var loader = new Loader( s('.__samsoncms_table') );		
		
		// Perform pager external init handlers
		for ( var int = 0; int < o.handlers.length; int++) o.handlers[ int ]( o );
				
		// Get parent container
		var container = s('#inner-content');	
		
		// Page swith event
		s('.__samson_pager_li').click( function(li)
		{			
			// Get page
			var page = parseInt(li.html());
			page = isNaN( page ) ? -1 : page;		
				
			// If we really switch page
			if( page != SamsonPager.currentPage)
			{		
				// Save current page
				SamsonPager.currentPage = page;
				
				// Get loading page number
				var text = li.hasClass('__samson_pager_all') ? 'Загрузка всех данных...' : 'Загрузка '+page+'-й страницы...';
				
				loader.show( text, true );
				
				// Get link controller
				var link = li.a('href');
				
				// Perform async request for page data
				s.ajax( link+'/1', function( response )
				{
					// Render view
					container.html( response );
					
					loader.remove();
					
					// Reinit pager
					o.init();			
					
					// Change URL if possible
					if( window.history ) window.history.pushState('','', link );					
				});
			}
			
		},true, true);
	};
	
	/** Init pager */
	//this.init();
};

// Create pager instance
var Pager = new Pager();

/** Pager asynchronous interaction */
s('.material-pages').pageInit( Pager.init );

