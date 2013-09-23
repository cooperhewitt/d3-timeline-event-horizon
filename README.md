d3-timeline-event-horizon
==

Example
--


	<link rel="stylesheet" type="text/css" href="css/d3.timeline.event-horizon.css" />
	<script type="text/javascript" src="javascript/d3.min.js"></script>
	<script type="text/javascript" src="javascript/d3.timeline.event-horizon.js"></script>

	<div id="timeline"></div>

	<script type="text/javascript">

	var context = [
		{ 'name': 'Andrew Carnegie', 'start': 1835, 'end': 1919 },
		{ 'name': 'Sarah Hewitt', 'start': 1858, 'end': 1930 },
		{ 'name': 'Eleanor Hewitt', 'start': 1864, 'end': 1924 },
		{ 'name': 'Cooper Union', 'start': 1897, 'end': 1967  },
		{ 'name': 'Carnegie mansion', 'start': 1903, 'end': 0 },
		{ 'name': 'Smithsonian', 'start': 1976, 'end': 0 },
		{ 'name': 'CHNDM', 'start': 1994, 'end': 0 },
		{ 'name': 'Renovations', 'start': 2011, 'end': 2014 },
		{ 'name': 'Re-opening', 'start': 2014, 'end': 0 },
	];

	var event = {
		'start': 1955,
		'end': 1975,
		'echo': 1971
	};

	var tl = new timeline("timeline", context);		
	tl.draw(event);

	$(window).resize(function(){
		tl.redraw();
	});

	</script>
