/* FeedEk jQuery RSS/ATOM Feed Plugin v3.2.0
 * Adapted to read local JSON news feeds
 * Original plugin by Engin KIZIL
 */

(function ($) {

    $.fn.FeedEk = function (options) {

        var def = $.extend({
            FeedFile: "data/bbc_world_news.json",
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
            getFeedData();
        };

        var getFeedData = function () {

            divFeed.empty();
            divFeed.append(
                '<img src="loader.gif" alt="Loading..." />'
            );

            $.ajax({
                url: def.FeedFile,
                dataType: "json",
                cache: false,

                success: function (result) {

                    divFeed.empty();

                    /*
                     * Our JSON structure contains the
                     * articles inside the "articles" property.
                     */
                    var data = result.articles;

                    if (!Array.isArray(data)) {
                        def.Error("Invalid news feed format.");
                        return;
                    }

                    /*
                     * Apply offset
                     */
                    data = data.slice(def.Offset);

                    /*
                     * Limit number of articles
                     */
                    if (def.MaxCount > 0) {
                        data = data.slice(0, def.MaxCount);
                    }

                    /*
                     * Generate and display HTML
                     */
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

                s += '<a href="' +
                    escapeHtml(itm.link) +
                    '" target="' +
                    def.TitleLinkTarget +
                    '">';

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

                    s += getDescription(
                        itm.description || ""
                    );

                    s += '</div>';
                }

                /*
                 * Author
                 */
                if (def.ShowAuthor && itm.author) {

                    s += '<div class="itemAuthor">';

                    s += escapeHtml(
                        def.AuthorLabel
                    );

                    s += ' ';

                    s += escapeHtml(
                        itm.author
                    );

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
         * Basic HTML escaping
         */
        var escapeHtml = function (text) {

            if (
                text === undefined ||
                text === null
            ) {
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
         * Date formatting
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