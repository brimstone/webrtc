var room = function(roomid) {
  atomic = (function(a) {
    "use strict";
    var b = {};
    var c = function(a) {
      var b;
      try {
        b = JSON.parse(a.responseText)
      } catch ( c ) {
        b = a.responseText
      } return [b, a]
    };
    var d = function(b, d, e) {
      var f = {
        success: function() {},
        error: function() {}
      };
      var g = a.XMLHttpRequest || ActiveXObject;
      var h = new g("MSXML2.XMLHTTP.3.0");
      h.open(b, d, !0), h.setRequestHeader("Content-type", "application/json"), h.onreadystatechange = function() {
        4 === h.readyState && (h.status >= 200 && h.status < 300 ? f.success.apply(f, c(h)) : f.error.apply(f, c(h)))
      }, h.send(e);
      var i = {
        success: function(a) {
          return f.success = a, i
        },
        error: function(a) {
          return f.error = a, i
        }
      };
      return i
    };
    return b.get = function(a) {
        return d("GET", a)
      }, b.put = function(a, b) {
        return d("PUT", a, b)
      }, b.post = function(a, b) {
        return d("POST", a, b)
      }, b["delete"] = function(a) {
        return d("DELETE", a)
      }, b
  })(this);

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  var myGuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();

  var peer = function() {
    var peer = webrtc();
    var myOfferId = "";

    function checkOffer() {
      peer.getOffer(function(offer) {
        console.log("Submitting offer to signalling server");
        atomic.post("https://webthoth.herokuapp.com/room/" + roomid, JSON.stringify({
          uuid: myGuid,
          offer: offer
        }))
          .success(function(data, xhr) {
            myOfferId = data;
          })
          .error(function(data, xhr) {
            console.log("Error", data);
          });
      });
    }

    var watchOffer = function() {}


    return {
      watchOffer: watchOffer
    }
  };

  var peers = [];
	/*
TODO

There's still a lot of work left here. When the first peer gets a valid answer, it has to accept it, then add its object to peer to the array or something

This room object also needs to watch the signalling server and try to answer offers for peer guids in which it is not connected.

This is a warning to the user.
*/
}




/*
atomic.get("https://webthoth.herokuapp.com/room/chat")
  .success(function(data, xhr) {
    var offerIds = data;
    for (var i = 0; i < offerIds.length; i++) {
      if (offerIds[i] == myOfferId) {
        console.log("Skipping my offer id")
        continue;
      }
      atomic.get("https://webthoth.herokuapp.com/room/chat/" + offerIds[i])
        .success(function(data, xhr) {
          var offerid = offerIds[i];
          console.log("Got offer", data);
          var peer = webrtc();
          peer.acceptOffer(data.offer, function(answer) {
            atomic.post("https://webthoth.herokuapp.com/room/chat/" + offerId, JSON.stringify({
              uuid: myGuid,
              answer: answer
            }))
          });
          peers.onMessage = function(msg) {
            console.log("got msg", msg)
          }
          peers.push(peer);
        });
    }
  })
*/
