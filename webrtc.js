webrtc = function() {
  var offer = "";
  var peer = new mozRTCPeerConnection(null, con);
  var dc1 = null;
  var con = {
    'optional': [{
      'DtlsSrtpKeyAgreement': true
    }, {
      'RtpDataChannels': true
    }]
  };

  function setupDC1() {
    try {
      dc1 = peer.createDataChannel('test', {
        reliable: false
      });
      dc1.onmessage = function(e) {
        console.log("Got message (peer)", e.data);
      }
      dc1.onopen = function(e) {
        console.log("dc1 opened", e)
        dc1.send("holy sheet")
      }
      dc1.onerror = function(e) {
        console.log("dc1 errored", e)
      }
      dc1.onclose = function(e) {
        console.log("dc1 closed", e)
      }
    } catch ( e ) {
      console.warn("No data channel (peer)", e);
    }
  }
  if (!peer.connectDataConnection) {
    setupDC1();
  }

  // this is public
  var getOffer = function(callback) {
    if (offer == "") {
      console.log("have to make an offer first")
      makeoffer(callback)
    } else {
      console.log("already have our offer")
      callback(offer);
    }
  };

  // this is private, but is called by getOffer
  var makeoffer = function(callback) {
    navigator.mozGetUserMedia({
      audio: true,
      fake: true
    }, function(stream) {
      console.log("Got local audio", stream);
      peer.addStream(stream);
      peer.createOffer(function(offerDesc) {
        console.log("Made offer", offerDesc);
        peer.setLocalDescription(offerDesc);
        peer.onicecandidate = function(e) {
          if (!e.candidate) {
            // wait for ice to finish gathering candidates
            offer = peer.localDescription.sdp
            if (callback) {
              callback(offer);
            }
          }
        };

      }, function() {
        console.warn("No create offer");
      });

    }, function() {
      console.warn("No audio");
    });
  };

  // this is public
  var acceptOffer = function(offer, callback) {
    var offerDesc = new mozRTCSessionDescription();
    offerDesc.type = "offer"
    offerDesc.sdp = offer
    console.log("Accepted offer", offerDesc);
    peer.setRemoteDescription(offerDesc);
    peer.createAnswer(function(answer) {
      console.log("Made answer", answer);
      peer.setLocalDescription(answer);
      peer.onicecandidate = function(e) {
        if (!e.candidate) {
          // wait for ice to finish gathering candidates
          answer = peer.localDescription.sdp
          if (callback) {
            callback(answer);
          }
        }
      }
    }, function() {
      console.warn("No create answer");
    });
  };

  // this is public
  var send = function(msg) {
    if (dc1) {
      dc1.send(msg);
    }
  };

  // This is public
  var acceptAnswer = function(answer, callback) {
    var answerDesc = new mozRTCSessionDescription();
    answerDesc.type = "answer"
    answerDesc.sdp = answer
    console.log("Accepted answer", answerDesc);
    peer.setRemoteDescription(answerDesc);
    if (callback) {
      callback();
    }
  };

  // this is private, but calls onMessage, which is public when there is data
  peer.ondatachannel = function(e) {
    var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
    console.log("Received datachannel (peer)", arguments);
    dc1 = datachannel;
    dc1.onmessage = function(e) {
      onMessage(e.data);
      //console.log("Got message (peer)", e.data);
    }
  }

  var onMessage = function() {};

  return {
    getOffer: getOffer,
    acceptOffer: acceptOffer,
    acceptAnswer: acceptAnswer,
    send: send,
    onMessage: onMessage,
    RTCPeerConnection: peer,
  }
}
