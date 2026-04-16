(function(){
  fetch('data/prices.json?v='+Date.now())
    .then(function(r){ return r.json(); })
    .then(function(data){

      // --- Private boat cards: [data-boat] ---
      document.querySelectorAll('[data-boat]').forEach(function(card){
        var boatId = card.dataset.boat;
        var boat = data.boats[boatId];
        if(!boat) return;

        var disc = boat.discount || 0;
        var discountedPrice = Math.round(boat.regularPrice * (1 - disc / 100));
        var extraDiscounted = boat.extraGuestRegular > 0 ? Math.round(boat.extraGuestRegular * (1 - disc / 100)) : 0;

        // Find all elements whose text is exactly a dollar amount ($X,XXX or $XX)
        var priceEls = [];
        var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null, false);
        while(walker.nextNode()){
          var t = walker.currentNode.textContent.trim();
          if(/^\$[\d,]+$/.test(t)){
            priceEls.push(walker.currentNode.parentElement);
          }
        }
        // Order: [0] regularPrice, [1] discountedPrice, [2] extraGuestRegular, [3] extraGuestDiscounted
        if(priceEls[0]) priceEls[0].textContent = '$' + boat.regularPrice.toLocaleString();
        if(priceEls[1]) priceEls[1].textContent = '$' + discountedPrice.toLocaleString();
        if(priceEls[2] && boat.extraGuestRegular > 0) priceEls[2].textContent = '$' + boat.extraGuestRegular;
        if(priceEls[3] && extraDiscounted > 0) priceEls[3].textContent = '$' + extraDiscounted;
      });

      // --- Discount labels ---
      document.querySelectorAll('[data-discount="label"]').forEach(function(el){
        var actId = el.closest('[data-activity]');
        if(actId && data.activities[actId.dataset.activity]){
          el.textContent = data.activities[actId.dataset.activity].discountLabel;
        }
      });

    })
    .catch(function(e){
      console.warn('Could not load prices:', e);
    });
})();
