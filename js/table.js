/**
 *
 * @param table DOM table element
 * @param pager
 * @constructor
 */

function SamsonCMSTable(table, pager) {
    /** Event: Publish/unpublish material */
    function publish(obj) {
        // ������� �������������
        if (confirm(obj.a('title'))) {
            // Perform ajax request and update JS on success
            s.ajax(s('a.publish_href', obj.parent()).a('href'), init);
        }
    }

    /** Event: Remove material */
    function remove(obj) {
        if (confirm(obj.a('title'))) s.ajax(obj.a('href'), init);
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
            if (serverResponse.pager_html) pager.html(serverResponse.pager_html);
        } catch (e) {

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

    // Ajax request handle
    var searchRequest;
    var searchTimeout;

    /**
     * Asynchronous material search
     * @param search Search query
     */
    function material_search(search) {
        // Safely get object
        search = s(search);

        var cmsnav = 0; //s('#cmsnav_id').val();
        var page = 1;

        // Key up handler
        search.keyup(function(obj, p, e) {
            // If we have not send any search request and this is not Enter character
            if (searchRequest == undefined && e.which != 13) {
                // Reset timeout on key press
                if (searchTimeout != undefined) clearTimeout(searchTimeout);

                // Set delayed function
                searchTimeout = window.setTimeout(function() {
                    // Get search input
                    var keywords = obj.val();

                    if (keywords.length < 2) keywords = '';

                    // Disable input
                    search.DOMElement.enabled = false;

                    // Perform async request to server for rendering table
                    searchRequest = asyncSearch(cmsnav, keywords, page, function(response) {
                        // re-render table
                        init(response);

                        // Clear request variable
                        searchRequest = undefined;
                    });

                }, 1000);
            }
        });
    }

    /**
     * Asynchronous request for table search
     * @param cmsnav    Current selected SamsonCMS navigation identifier
     * @param keywords  Material search keywords
     * @param page      Current search page results
     * @param handler   External handler on ajax success request
     * @returns Asynchronous request handle
     */
    var asyncSearch = function(cmsnav, keywords, page, handler) {
        // Avoid multiple search requests
        if (!searchInitiated) {
            // Set flag
            searchInitiated = true;

            // Create generic loader
            var loader = new Loader(table);

            // Show loader with i18n text and black bg
            loader.show(s('.loader-text').val(), true);

            // Perform async request to server for rendering table
            return s.ajax(s('input#search').a('controller') + cmsnav + '/' + keywords + '/' + page, function(response) {
                // re-render table
                init(response);

                // Call external handler
                if (handler) {
                    handler();
                }

                loader.hide();

                // Release flag
                searchInitiated = false;
            });
        }
    }

    // Cache search field
    var searchField = s('input#search');

    // Flag to preserve multiple search requests
    var searchInitiated = false;

    // Init table live search
    material_search(searchField);

    // Disable search form submit
    s('form.search').submit(function() {
        // Get search input
        var keywords = searchField.val();

        // Remove possible search timeout
        clearTimeout(searchTimeout);
        // Abort current search request
        searchRequest ? searchRequest.abort() : null;

        // Perform async request to server for rendering table
        asyncSearch(0, keywords, 1, function(response) {
            // re-render table
            init(response);
        });

        return false;
    });

    // Init table
    init();
}
