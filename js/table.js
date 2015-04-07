/**
 *
 * @param table DOM table element
 * @param pager
 * @param asyncCompleteHandler External handler after async table rendering
 * @constructor
 */

function SamsonCMSTable(table, pager, asyncCompleteHandler) {

	var completeHandler = asyncCompleteHandler !== undefined ? asyncCompleteHandler : false;
	
    /** Event: Publish/unpublish material */
    function publish(obj) {
        // ������� �������������
        if (confirm(obj.a('title'))) {
            // Perform ajax request and update JS on success
            s.ajax(s('a.publish_href', obj.parent()).a('href'), init, FormData, function() {
                loader.hide();
            }, function() {
                // Create generic loader
                var loader = new Loader(table);

                // Show loader with i18n text and black bg
                loader.show('', true);
                return true;
            });
        }
    }

    /** Event: Remove material */
    function remove(obj) {
        if (confirm(obj.a('title'))) {
            s.ajax(obj.a('href'), init, FormData, function() {
                loader.hide();
            }, function() {
                // Create generic loader
                var loader = new Loader(table);

                // Show loader with i18n text and black bg
                loader.show('', true);
                return true;
            });
        }
    }

    /** Event: Copy material */
    function copy(obj) {
        if (confirm(obj.a('title'))) s.ajax(obj.a('href'), init);
    }

    /**
     * �������� ������� ����������
     *
     * @param data ���������� ������� ��� ����������
     */
    function init(serverResponse) {
        // If we have responce from server
        if (serverResponse) try {
            // Parse JSON response
            serverResponse = JSON.parse(serverResponse);
        } catch (e) {

        }

        try {
            // If we have table html - update it
            if (serverResponse.table_html) table.html(serverResponse.table_html);
            if (serverResponse.table_pager) pager.html(serverResponse.table_pager);
        } catch (e) {

        }
		
		if (completeHandler) {
            completeHandler(table, pager);
        }

        // If we have successful event response or no response at all(first init)
        if (!serverResponse || (serverResponse && serverResponse.status)) {
            // Add fixed header to materials table
            table.fixedHeader();

            // Bind publish event
            s('input#published', table).click(publish, true, true);

            // Bind remove event
            s('a.delete', table).click(remove, true, true);

            s('a.edit', table).tinyboxAjax({
                html : 'html',
                renderedHandler : function(respTxt, tb) {
                    s('.cms_table_form').ajaxSubmit(function(response){
                        tb._close();
                        init(serverResponse);
                    })
                }
            });


            s('a', pager).each(function(obj) {
                obj.ajaxClick(function(response) {
                    loader.hide();
                    init(response);
                }, function(){
                    // Create generic loader
                    var loader = new Loader(table);

                    // Show loader with i18n text and black bg
                    loader.show('', true);
                    return true;
                });
            });
        }
    }



    // Cache search field
    //var searchField = s();

    var cmsnav = '0'; //s('#cmsnav_id').val();
    if (s('#cmsnav_id').val().length) {
        cmsnav = s('#cmsnav_id').val();
    }

    // Init table live search
    s('input#search').search(new Array(cmsnav), function(){
        // Create generic loader
        var loader = new Loader(table);
        // Show loader with i18n text and black bg
        loader.show(s('.loader-text').val(), true);
    }, function(response){
        loader.hide();
        init(response);
    });

    // Disable search form submit
    //s('form.search').submit(function() {
    //    // Get search input
    //    var keywords = searchField.val();
    //
    //    // Remove possible search timeout
    //    clearTimeout(searchTimeout);
    //    // Abort current search request
    //    searchRequest ? searchRequest.abort() : null;
    //
    //    // Perform async request to server for rendering table
    //    asyncSearch(0, keywords, 1, function(response) {
    //        // re-render table
    //        init(response);
    //    });
    //
    //    return false;
    //});

    // Init table
    init();
}
