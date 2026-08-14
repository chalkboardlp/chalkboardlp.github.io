/* FeedEk jQuery RSS/ATOM Feed Plugin v3.2.0
 * Adapted to read a local news.json file
 * Original plugin by Engin KIZIL
 */

(function ($) {

    $.fn.FeedEk = function (options) {

        var def = $.extend({
            MaxCount: 3,
            ShowDesc: true,
            ShowPubDate: true,
            DescCharacterLimit: 0,
            TitleLinkTarget: "_blank",
            DateFormat: "",
            DateFormatLang: "en",
            Offset: 0,
            ShowAuthor: false,
            AuthorLabel: "Author:",
            Success: function () { },
            Error: function () { }
        }, options);

        var divFeed = this;

        var init = function () {

            /*
             * The RSS feed is now converted automatically by
             * GitHub Actions into news.json.
             *
             * news.json is located in the same folder as index.html.
             */
            getFeedData();
        };

        var getFeedData = function () {

            divFeed.empty();
            divFeed.append('<img src="loader.gif" alt="Loading..." />');

            $.ajax({
                url: "../../../news.json",
                dataType: "json",
                cache: false,

                success: function (result) {

                    divFeed.empty();

                    if (!result || !Array.isArray(result)) {
                        def.Error("Invalid news.json format.");
                        return;
                    }

                    /*
                     * Apply offset if requested
                     */
                    var data = result.slice(def.Offset);

                    /*
                     * Limit the number of news items
                     */
                    if (def.MaxCount > 0) {
                        data = data.slice(0, def.MaxCount);
                    }

                    divFeed.append(generateHtml(data));

                    def.Success(data);
                },

                error: function (xhr, status, error) {

                    divFeed.empty();

                    def.Error({
                        status: status,
                        error: error,
                        xhr: xhr
                    });
                }
            });
        };

        var generateHtml = function (data) {

            var s = "";

            $.each(data, function (e, itm) {

                s += '<li>';

                /*
                 * Title
                 */
                s += '<div class="itemTitle">';
                s += '<a href="' + escapeHtml(itm.link) +
                     '" target="' + def.TitleLinkTarget + '">';
                s += escapeHtml(itm.title);
                s += '</a>';
                s += '</div>';

                /*
                 * Publication date
                 */
                if (def.ShowPubDate) {

                    s += '<div class="itemDate">';

                    if (itm.pubDate) {

                        var date = new Date(itm.pubDate);

                        if (!isNaN(date.getTime())) {

                            if ($.trim(def.DateFormat).length > 0) {
                                s += formatDate(date);
                            } else {
                                s += date.toLocaleDateString(
                                    def.DateFormatLang
                                );
                            }

                        } else {
                            s += escapeHtml(itm.pubDate);
                        }
                    }

                    s += '</div>';
                }

                /*
                 * Description
                 */
                if (def.ShowDesc) {

                    s += '<div class="itemContent">';
                    s += getDescription(itm.description || "");
                    s += '</div>';
                }

                /*
                 * Author
                 */
                if (def.ShowAuthor && itm.author) {

                    s += '<div class="itemAuthor">';
                    s += escapeHtml(def.AuthorLabel) + ' ';
                    s += escapeHtml(itm.author);
                    s += '</div>';
                }

                s += '</li>';
            });

            return '<ul class="feedEkList">' + s + '</ul>';
        };

        /*
         * Limit description length
         */
        var getDescription = function (desc) {

            if (
                def.DescCharacterLimit > 0 &&
                desc.length > def.DescCharacterLimit
            ) {
                desc = desc.substring(
                    0,
                    def.DescCharacterLimit
                ) + '...';
            }

            return desc;
        };

        /*
         * Basic HTML escaping for titles and links
         */
        var escapeHtml = function (text) {

            if (text === undefined || text === null) {
                return "";
            }

            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        /*
         * Simple date formatting
         */
        var formatDate = function (date) {

            return date.toLocaleDateString(
                def.DateFormatLang,
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            );
        };

        init();
    };

})(jQuery);
