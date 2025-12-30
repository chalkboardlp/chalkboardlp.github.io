(function($) {
    $("document").ready(function() {
        $("#shuffle-player").click(function() {
         
            var playerID = 1;
            var instance = $("#amazingaudioplayer-" + playerID).data("object"); 
             
            for (var i = instance.elemLength - 1; i > 0; i--)
            {
                if ((i == 1) && (Math.random() < 0.5))
                    break;
                         
                var index = Math.floor(Math.random() * i);
                 
                var temp = instance.elemArray[index];
                instance.elemArray[index] = instance.elemArray[i];
                instance.elemArray[i] = temp;
                                 
                temp = instance.playerSkin.trackitems[index];
                instance.playerSkin.trackitems[index] = instance.playerSkin.trackitems[i];
                instance.playerSkin.trackitems[i] = temp;
                 
                var tracks = $("#amazingaudioplayer-" + playerID + " .amazingaudioplayer-track-item");
                var track0 = tracks.eq(index);
                var track1 =  tracks.eq(i);         
                track0.insertBefore(track1);
                 
                tracks = $("#amazingaudioplayer-" + playerID + " .amazingaudioplayer-track-item");
                track1.insertBefore(tracks.eq(index));
            }
                     
            for (var i = 0; i< instance.elemLength; i++)
                instance.elemArray[i].id = i + 1;
             
            $("#amazingaudioplayer-" + playerID + " .amazingaudioplayer-track-item").each(function(i) {
                $(this).data("order", i);
                if ($(this).hasClass("amazingaudioplayer-track-item-active"))
                    instance.currentItem = i;
                $(".amazingaudioplayer-item-id", this).text(i + 1);
            });
             
        });
    });
})(jQuery);
