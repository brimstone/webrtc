webrtc = (function() {
  var offer = "";
  var pc1 = new mozRTCPeerConnection(null, con);
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
      dc1 = pc1.createDataChannel('test', {
        reliable: false
      });
      dc1.onmessage = function(e) {
        console.log("Got message (pc1)", e.data);
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
      console.warn("No data channel (pc1)", e);
    }
  }
  if (!pc1.connectDataConnection) {
    setupDC1();
  }

  // this is called when the browser figures out an IP address
  // this is called from a button
  getOffer = function(callback) {
    if (offer == "") {
      console.log("have to make an offer first")
      makeoffer(callback)
    } else {
      console.log("already have our offer")
      callback(offer);
    }
  }

  makeoffer = function(callback) {
    navigator.mozGetUserMedia({
      audio: true,
      fake: true
    }, function(stream) {
      console.log("Got local audio", stream);
      pc1.addStream(stream);
      pc1.createOffer(function(offerDesc) {
        console.log("Made offer", offerDesc);
        pc1.setLocalDescription(offerDesc);
        pc1.onicecandidate = function(e) {
          if (!e.candidate) {
            // wait for ice to finish gathering candidates
            offer = pc1.localDescription.sdp
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
  }

  // this is called from a button
  acceptOffer = function() {
    offer = document.getElementById("offer").value
    var offerDesc = new mozRTCSessionDescription();
    offerDesc.type = "offer"
    offerDesc.sdp = offer
    console.log("Accepted offer", offerDesc);
    pc1.setRemoteDescription(offerDesc);
    pc1.createAnswer(function(answer) {
      console.log("Made answer", answer);
      pc1.setLocalDescription(answer);
    }, function() {
      console.warn("No create answer");
    });
  }

  // this is called once we have all our candidates
  function updateOffer() {
    document.getElementById("offer").value = offer
  }

  // this is called from a button
  function sendPing() {
    if (dc1) {
      dc1.send("ping");
    }
  }

  getAnswer = function() {}
  // This is called from a button
  acceptAnswer = function() {
    offer = document.getElementById("offer").value
    var answer = new mozRTCSessionDescription();
    answer.type = "answer"
    answer.sdp = offer
    console.log("Accepted answer", answer);
    pc1.setRemoteDescription(answer);
  }

  // This is called on the receiver
  pc1.ondatachannel = function(e) {
    var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
    console.log("Received datachannel (pc1)", arguments);
    dc1 = datachannel;
    dc1.onmessage = function(e) {
      console.log("Got message (pc1)", e.data);
    }
  }

  return {
    getOffer: getOffer,
    acceptOffer: acceptOffer,
    getAnswer: getAnswer,
  }
}())
