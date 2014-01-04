		// Initialize all global vars
		var autocomplete ;
		var map ;
		var geocoder;
		var marker = [ new google.maps.Marker({ map: null, position: null, draggable : true, icon: "1.png" }) , new google.maps.Marker({ map: null, position: null, draggable : true, icon: "2.png"  })  ];	
		var dragged = [false, false] ;
		var stringPos ; 
		var rectangle = [ new google.maps.Rectangle({ map: null, bounds: null }) , new google.maps.Rectangle({ map: null, bounds: null }) ] ;
		var pinCenter = false ;
		var pinningListener ; 
		var pinning = false ;

		function initialize() 
		{
			// Create the map and initialize the autocomplete and the geocoder
			google.maps.visualRefresh = false ;
			var mapOptions = 
			{
				center: new google.maps.LatLng(42.7, 23.3),  
				zoom: 12,
				scaleControl: true,
			    scaleControlOptions: 
			    {
			        position: google.maps.ControlPosition.BOTTOM_LEFT
			    },									
			};
			map = new google.maps.Map(document.getElementById("map-canvas") , mapOptions);  
			autocomplete = [ new google.maps.places.Autocomplete ( document.getElementById('addressUser0') )  ,  new google.maps.places.Autocomplete ( document.getElementById('addressUser1') ) ] ; 
			geocoder = new google.maps.Geocoder();


			// What to do when the place changed from the autocomplete or manually by the user, pin 1 & 2
			// 1
			function change(address, value)
			{
				// If not being dragged, reset pin & rectangle and calls the geocoding function
				if ( !dragged[address] ) 
				{
					marker[address].setMap(null) ;
					rectangle[address].setMap(null) ;
					pinFromInput ( value, address ) ;

				}
				useButton(address, 0) ;

				document.getElementById('addressGoogle'+address).value = value  ;
			}

			google.maps.event.addListener(autocomplete[0], 'place_changed', function() 
			{			
				var place = autocomplete[0].getPlace() ;

				if ( place['formatted_address'] )
					change(0, place['formatted_address']) ;
				else
					change(0, document.getElementById('addressUser0').value ) ; 
			})  ;
			document.getElementById('addressUser0').addEventListener("change", function(e)
			{
				change(0, e["target"]['value']) ;
			}, false) ;

			// 2
			google.maps.event.addListener(autocomplete[1], 'place_changed', function() 
			{			
				var place = autocomplete[1].getPlace() ;

				if ( place['formatted_address'] )
					change(1, place['formatted_address']) ;
				else
					change(1, document.getElementById('addressUser1').value ) ; 
			})  ;
			document.getElementById('addressUser1').addEventListener("change", function(e)
			{
				change(1, e["target"]['value']) ;
			}, false) ;			





			// Behaviour when pin is dragged, pin 1 & 2
			// 1
			google.maps.event.addListener(marker[0], 'dragstart', function() 
			{
				dragged[0] = true ;
			});
			google.maps.event.addListener(marker[0], 'dragend', function() 
			{
				dragged[0] = false ;
				pinFromInput ( document.getElementById('coordinates0').value, 0 ) ;
				useButton(0, 1) ;
			});
			google.maps.event.addListener(marker[0], 'drag', function() 
			{
				stringPos = marker[0].getPosition().toString().substr(1) ;
				stringPos = stringPos.substr(0, stringPos.length-1)
				document.getElementById('coordinates0').value = stringPos ;
			});
			// 2
			google.maps.event.addListener(marker[1], 'dragstart', function() 
			{
				dragged[1] = true ;
			});
			google.maps.event.addListener(marker[1], 'dragend', function() 
			{
				dragged[1] = false ;
				pinFromInput ( document.getElementById('coordinates1').value, 1 ) ;
				useButton(1, 1) ;
			});
			google.maps.event.addListener(marker[1], 'drag', function() 
			{
				stringPos = marker[1].getPosition().toString().substr(1) ;
				stringPos = stringPos.substr(0, stringPos.length-1)
				document.getElementById('coordinates1').value = stringPos ;
			});





			// Behavior when rectangle is clicked, rectangle 1 & 2
			// 1
			google.maps.event.addListener(rectangle[0], 'click', function(event) 
			{
				rectangle[0].setMap(null) ;
				marker[0].setMap(map) ;
				marker[0].setPosition(event.latLng) ;

				stringPos = event.latLng.toString().substr(1) ;
				stringPos = stringPos.substr(0, stringPos.length-1) ;
				document.getElementById('coordinates0').value = stringPos ;
				pinFromInput(stringPos, 0) ;

				useButton(0, 1) ;
			});
			// 2
			google.maps.event.addListener(rectangle[1], 'click', function(event) 
			{
				rectangle[1].setMap(null) ;
				marker[1].setMap(map) ;
				marker[1].setPosition(event.latLng) ;

				stringPos = event.latLng.toString().substr(1) ;
				stringPos = stringPos.substr(0, stringPos.length-1) ;
				document.getElementById('coordinates1').value = stringPos ;
				pinFromInput(stringPos, 1) ;

				useButton(1, 1) ;

			});	
		}
			
		google.maps.event.addDomListener(window, 'load', initialize);

		// Clear everything
		function clearAll(i)
		{
			marker[i].setMap(null); 
			rectangle[i].setMap(null);
			document.getElementById('coordinates'+i).value = '' ;
			document.getElementById('addressUser'+i).value = '' ;
			document.getElementById('addressGoogle'+i).value = '' ;
			document.getElementById('details'+i).innerHTML = '' ;
		}

		// Set a pin to the center of the map
		function pinToCenter(i)
		{
			clearAll(i) ;

			// If we clicked on the pin button, add the event listener, change cursor and change pin to hand image
			if ( pinning == false )
			{
				map.setOptions({draggableCursor: 'crosshair'}) ;
				pinning = true ;
				document.getElementById('pin'+i).src = "hand.png" ;

				// Follow click event, on it set marker position, input values, geocode
				pinningListener = google.maps.event.addListener(map, 'click', function(e) 
				{
	                marker[i].setPosition(e.latLng) ;
					marker[i].setMap(map) ;

					stringPos = e.latLng.toString().substr(1) ;
					stringPos = stringPos.substr(0, stringPos.length-1) ;
					document.getElementById('coordinates'+i).value = stringPos ;
					pinCenter = true ;
					pinFromInput(stringPos, i) ;

					google.maps.event.removeListener(pinningListener) ;
					map.setOptions({draggableCursor: ''}) ;
					pinning = false ;
					document.getElementById('pin'+i).src = "pin.png" ;

	            });
			}
			// I we clicked on the hand, remove listener, reset cursor and delete marker
			else
			{
 				google.maps.event.removeListener(pinningListener) ;
 				map.setOptions({draggableCursor: ''}) ;
 				document.getElementById('pin1').src = "pin.png" ;
 				document.getElementById('pin0').src = "pin.png" ;
                marker[i].setPosition(null) ;
				marker[i].setMap(null) ;
				pinning = false ;
			}
		}	

		// Center the map around a pin or a rectangle
		function centerMap(i)
		{
			if ( document.getElementById('coordinates'+i).value )
			{
				var pos = document.getElementById('coordinates'+i).value.split(",") ;
				map.panTo(new google.maps.LatLng(pos[0].trim(), pos[1].trim())) ;
			}
			else if (rectangle[i].getMap()!=null)
			{
				map.fitBounds(rectangle[i].getBounds()) ;				
			}
		}

		// 1 or 2 addresses ? 
		function check (value)
		{
			var displayBlock = {1: "none", 2:"block"};
			var displayInline = {1: "none", 2:"inline"};

			document.getElementById('coordinates1').style.display = displayInline[value];
			document.getElementById('addressUser1').style.display = displayInline[value];
			document.getElementById('addressGoogle1').style.display = displayInline[value];
			document.getElementById('details1').style.display = displayBlock[value];
			document.getElementById('clear1').style.display = displayInline[value];
			document.getElementById('center1').style.display = displayInline[value];
			document.getElementById('pin1').style.display = displayInline[value];
			document.getElementById('useGoogle1').style.display = displayInline[value];
			document.getElementById('useGPS1').style.display = displayInline[value];
			
		}


		// Use buttons
		function useGPS(value)
		{
			document.getElementById('addressUser'+value).value = document.getElementById('coordinates'+value).value ;
			useButton(value, 0) ;
		}
		function useGoogle(value)
		{
			document.getElementById('addressUser'+value).value = document.getElementById('addressGoogle'+value).value ;	
			useButton(value, 0) ;
		}

		function useButton(address, value)
		{
			var color = ["", "red"] ;
			var title = ["", "The address has changed, want to use it?"] ;
			document.getElementById('useGoogle'+address).style.backgroundColor = color[value] ;
			document.getElementById('useGPS'+address).style.backgroundColor = color[value] ;
			document.getElementById('useGoogle'+address).title = title[value] ;
			document.getElementById('useGPS'+address).title = title[value] ;
		}

		// Geocoding function
		function pinFromInput (inputValue, index)
		{
			// Initialization of vars and reset of output
			var pos = inputValue.split(",") ;
			var request, requestType, resultsString, inputs = '', divs = '' ; 
			document.getElementById('details'+index).innerHTML = '' ;


			// Check if we have a position or an address to build the appropriate request
			if ( pos.length == 2 && !isNaN(pos[0].trim()) && !isNaN(pos[1].trim()) ) // Position
			{
				request = { 'location' : new google.maps.LatLng(pos[0].trim(), pos[1].trim()) } ;
				requestType = 'latlng' ;
				marker[index].setMap(map) ;
				marker[index].setPosition(new google.maps.LatLng(pos[0].trim(), pos[1].trim())) ;
				map.panTo(new google.maps.LatLng(pos[0].trim(), pos[1].trim())) ;
				document.getElementById('coordinates'+index).value = pos[0].trim()+', '+pos[1].trim() ;
			}
			else // Address
			{
				request = { 'address': inputValue} ;
			    requestType = 'address' ;
			}

			geocoder.geocode( request, function(results, status) 
			{
				// If we added a pin to the center of the map, put address in user input
				if ( pinCenter )
				{
					document.getElementById('addressUser'+index).value = results[0]["formatted_address"] ;
					pinCenter = false ;
				}

				// If we have an exact position, we need to reverse geocode it
				if ( requestType == 'latlng')
				{
					document.getElementById('addressGoogle'+index).value = results[0]["formatted_address"] ;
				}
				// If we didn't have an exact position, we still have to put a pin or a rectangle
				if ( requestType == "address" )
				{
					// If position is not exact, create a rectangle
					if ( results[0]["geometry"]["location_type"] != "ROOFTOP" )
					{
						rectangle[index].setBounds(results[0]["geometry"]['bounds']) ;
						rectangle[index].setMap(map) ;
						map.fitBounds(results[0]["geometry"]["viewport"]) ;
						document.getElementById('coordinates'+index).value = '' ;
						document.getElementById('addressGoogle'+index).value = results[0]["formatted_address"] ;
					}
					// If exact position found, set the pin to the position
					else
					{
						rectangle[index].setMap(null) ;
						marker[index].setMap(map) ;
						marker[index].setPosition(results[0]["geometry"]["location"]) ;
						map.fitBounds(results[0]["geometry"]["viewport"]) ;

						document.getElementById('addressGoogle'+index).value = results[0]["formatted_address"] ;
						stringPos = results[0]["geometry"]["location"].toString().substr(1) ;
						stringPos = stringPos.substr(0, stringPos.length-1) ;
						document.getElementById('coordinates'+index).value = stringPos ;
					}
				}

				// Outputs the json results
			    for ( var j = 0 ; j < results.length ; j++ )
			    {
				    divs = divs + "Result " + j + "<textarea rows=\"5\" name=\"result"+index+"-"+j+"\" style=\"width:90%\">"+JSON.stringify(results[j])+"</textarea><br/>" ;
			    }

			    document.getElementById('details'+index).innerHTML = divs ;
  			});
		}