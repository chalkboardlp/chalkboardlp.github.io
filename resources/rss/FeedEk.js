/*
 * FeedEk jQuery RSS/ATOM Feed Plugin
 * Modified version
 *
 * Compatible with the existing HTML:
 *
 * $('#divRss').FeedEk({
 *     FeedUrl : 'https://feeds.bbci.co.uk/news/world/rss.xml'
 * });
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

            Success: function () {},

            Error: function () {}

        }, options);


        var divFeed = this;


        /*
         * Initialize
         */

        var init = function () {

            if (def.FeedUrl === undefined) {

                console.error("FeedEk: FeedUrl is missing.");

                return;

            }

            getFeedData();

        };


        /*
         * Load RSS feed
         */

        var getFeedData = function () {

            divFeed.empty();

            divFeed.append(
                '<div class="feedEkLoading">Loading...</div>'
            );


            var feedUrl = def.FeedUrl;


            /*
             * CORS proxy
             *
             * This allows the browser to request the BBC RSS feed
             * without depending on the old FeedEk server.
             */

            var proxyUrl =
                "https://api.allorigins.win/raw?url=" +
                encodeURIComponent(feedUrl);


            $.ajax({

                url: proxyUrl,

                type: "GET",

                dataType: "text",

                cache: false,


                success: function (xmlText) {

                    try {

                        /*
                         * Convert RSS XML text into XML document
                         */

                        var xml = $.parseXML(xmlText);

                        var $xml = $(xml);

                        var items = [];


                        /*
                         * RSS
                         */

                        $xml.find("item").each(function () {

                            var $item = $(this);


                            var title =
                                $item.find("title").first().text();


                            var link =
                                $item.find("link").first().text();


                            var description =
                                $item.find("description").first().text();


                            var pubDate =
                                $item.find("pubDate").first().text();


                            var author =
                                $item.find("author").first().text();


                            /*
                             * Some RSS feeds use dc:creator
                             */

                            if (!author) {

                                author =
                                    $item.find("creator").first().text();

                            }


                            items.push({

                                title: title,

                                link: link,

                                description: description,

                                publishDate: pubDate,

                                publishDateFormatted: pubDate,

                                author: author

                            });

                        });


                        /*
                         * ATOM support
                         */

                        if (items.length === 0) {

                            $xml.find("entry").each(function () {

                                var $item = $(this);


                                var title =
                                    $item.find("title").first().text();


                                var link =
                                    $item.find("link").first().attr("href");


                                if (!link) {

                                    link =
                                        $item.find("link").first().text();

                                }


                                var description =
                                    $item.find("summary").first().text();


                                if (!description) {

                                    description =
                                        $item.find("content").first().text();

                                }


                                var pubDate =
                                    $item.find("published").first().text();


                                if (!pubDate) {

                                    pubDate =
                                        $item.find("updated").first().text();

                                }


                                var author =
                                    $item.find("author name").first().text();


                                items.push({

                                    title: title,

                                    link: link,

                                    description: description,

                                    publishDate: pubDate,

                                    publishDateFormatted: pubDate,

                                    author: author

                                });

                            });

                        }


                        /*
                         * Apply offset
                         */

                        if (def.Offset > 0) {

                            items =
                                items.slice(def.Offset);

                        }


                        /*
                         * Limit number of articles
                         */

                        items =
                            items.slice(0, def.MaxCount);


                        /*
                         * Remove loading message
                         */

                        divFeed.empty();


                        /*
                         * No articles found
                         */

                        if (items.length === 0) {

                            divFeed.append(
                                '<div class="feedEkError">' +
                                'No RSS articles found.' +
                                '</div>'
                            );


                            console.error(
                                "FeedEk: No RSS/ATOM items found."
                            );


                            def.Error({

                                status: 404,

                                statusText:
                                    "No RSS/ATOM items found"

                            });


                            return;

                        }


                        /*
                         * Generate HTML
                         */

                        divFeed.append(
                            generateHtml(items)
                        );


                        /*
                         * Success callback
                         */

                        def.Success(items);


                    }

                    catch (error) {

                        divFeed.empty();


                        divFeed.append(
                            '<div class="feedEkError">' +
                            'Unable to read RSS feed.' +
                            '</div>'
                        );


                        console.error(
                            "FeedEk RSS parsing error:",
                            error
                        );


                        def.Error(error);

                    }

                },


                error: function (error) {

                    divFeed.empty();


                    divFeed.append(
                        '<div class="feedEkError">' +
                        'Unable to load RSS feed.' +
                        '</div>'
                    );


                    console.error(
                        "FeedEk RSS loading error:",
                        error
                    );


                    def.Error(error);

                }

            });

        };


        /*
         * Generate feed HTML
         */

        var generateHtml = function (data) {

            var s = "";


            $.each(data, function (e, itm) {


                s +=
                    '<li>' +

                    '<div class="itemTitle">' +

                    '<a href="' +
                    escapeHtml(itm.link) +
                    '" target="' +
                    escapeHtml(def.TitleLinkTarget) +
                    '">' +

                    escapeHtml(itm.title) +

                    '</a>' +

                    '</div>';


                /*
                 * Publication date
                 */

                if (def.ShowPubDate) {

                    s +=
                        '<div class="itemDate">';


                    var date =
                        new Date(itm.publishDate);


                    if (!isNaN(date.getTime())) {

                        s +=
                            date.toLocaleDateString(
                                def.DateFormatLang
                            );

                    }

                    else {

                        s +=
                            escapeHtml(
                                itm.publishDate
                            );

                    }


                    s +=
                        '</div>';

                }


                /*
                 * Description
                 */

                if (def.ShowDesc) {

                    s +=
                        '<div class="itemContent">' +

                        getDescription(
                            itm.description
                        ) +

                        '</div>';

                }


                /*
                 * Author
                 */

                if (def.ShowAuthor) {

                    s +=
                        '<div class="itemAuthor">' +

                        escapeHtml(
                            def.AuthorLabel
                        ) +

                        ' ' +

                        escapeHtml(
                            itm.author || ""
                        ) +

                        '</div>';

                }


                s +=
                    '</li>';

            });


            return (
                '<ul class="feedEkList">' +
                s +
                '</ul>'
            );

        };


        /*
         * Description character limit
         */

        var getDescription = function (desc) {

            desc = desc || "";


            if (

                def.DescCharacterLimit > 0 &&

                desc.length >
                def.DescCharacterLimit

            ) {

                desc =
                    desc.substring(
                        0,
                        def.DescCharacterLimit
                    ) +
                    "...";

            }


            return desc;

        };


        /*
         * Basic HTML escaping
         */

        var escapeHtml = function (text) {

            return String(
                text == null ? "" : text
            )

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#039;"
                );

        };


        /*
         * Start plugin
         */

        init();

    };

})(jQuery);