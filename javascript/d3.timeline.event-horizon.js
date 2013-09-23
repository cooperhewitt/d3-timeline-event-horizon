// See the way all the heights and offsets are hard-coded?
// That's not a feature. One thing at a time (20130918/straup)

function timeline(container, ctx){
    
    var padding = 20;

    var min = d3.min(ctx, function(d){ return d['start'] });
    var max = d3.max(ctx, function(d){ return d['end'] });
    
    var before = min - padding;
    var after = max + padding;

    this.ctx = ctx;

    var beginnings = [];
    var endings = [];

    for (var i in this.ctx){
	var start = this.ctx[i]['start'];
	
	if ((start) && ($.inArray(start, beginnings) == -1)){
	    beginnings.push(start);
	}
    }
    
    for (var i in this.ctx){
	var end = this.ctx[i]['end'];
	
	if ((end) && ($.inArray(end, endings) == -1) && ($.inArray(end, beginnings) == -1)){
	    endings.push(end);
	}
    }

    this.beginnings = beginnings;
    this.endings = endings;

    this.ctx.unshift({ 'name': 'before and after', 'start': before, 'end': after });

    this.container = container;

    this.min = min;
    this.max = max;
    this.padding = padding;

    this.before = before;
    this.after = after;

    this.svg = null;
    this.scale = null;

    this.h = null
    this.w = null;

    this.evt = null;

    this.setup()
}

timeline.prototype.setup = function(){

    var parent_id = "#" + this.container;

    var w = $(parent_id).innerWidth();
    var h = $(parent_id).innerHeight();

    this.h = h;
    this.w = w;

    var parent_id = "#" + this.container;

    var svg = d3.select(parent_id)
	.append("svg");

    svg.attr("width", w);
    svg.attr("height", h);

    var scale = d3.scale.linear()
	.domain([this.before, this.after])
	.range([ 0, w ]);
    
    this.svg = svg;
    this.scale = scale;
}

timeline.prototype.redraw = function(){
    var tl = d3.select("#timeline");
    var s = tl.select("svg");
    s.remove();

    this.setup();
    this.draw(this.evt);
}

timeline.prototype.draw = function(evt){

    if (evt){
	this.evt = evt;
    }

    this.draw_event_blocks();
    this.draw_beginnings();
    this.draw_endings();
    this.draw_ctx();    
    this.draw_evt();
};

timeline.prototype.draw_event_blocks = function(){

    var scale = this.scale;
    var max = this.max;
    var h = this.h;

    this.svg.selectAll("rect-fill")	
	.data(this.ctx)
	.enter()
	.append("rect")
	.attr("x", function(d, i){
	    return scale(d['start']);
	})
	.attr("y", function(d){
	    return h - 75;
	})
	.attr("width", function (d){
	    
	    if (d['end'] == 0){
		d['end'] = max;
	    }
	    
	    return scale(d['end']) - scale(d['start']);
	})
	.attr("height", function(d){
	    return 35;
	}) 
	.attr("class", function(d){
	    
	    var classes = [
		"timeline-block"
	    ];
	    
	    if (d['name'] == 'before and after'){
		classes.push("timeline-before-after");
	    }

	    return classes.join(" ");
	})
    	.attr("id", function(d){
	    return "event-" + d['start'] + "-"  + d['end'];
	});
    
};

timeline.prototype.draw_beginnings = function(){

    var self = this;
    var scale = this.scale;

    this.svg.selectAll("text-beginnings")
	.data(this.beginnings)
	.enter()
	.append("text")
	.text(function(d){

	    if (! self.evt){
		return d;
	    }

	    var start = self.evt['start'];
	    var end = self.evt['end'];
	    var echo = self.evt['echo'];
	    
	    var dist = (start < d) ? (scale(d) - scale(start)) : (scale(start) - scale(d));
	    var show = ((! start) || (dist >= 16)) ? 1 : 0;

	    if ((show) && (end)){
		dist = (start < d) ? (scale(d) - scale(end)) : (scale(end) - scale(d));
		show = ((dist <= -16) || (dist >= 16)) ? 1 : 0;
	    }

	    if ((show) && (echo)){
		// I feel like I must be doing something wrong here
		// but I am not sure what... (20130919/straup)
		dist = (start < d) ? (scale(d) - scale(echo)) : (scale(echo) - scale(d));
		show = ((dist <= -16) || (dist >= 16)) ? 1 : 0;
	    }

	    return (show) ? d : "";
	})
	.attr("x", function(d, i){
	    d = scale(d) - 12;
	    return d;
	})
	.attr("y", function(d, i){
	    return 195;
	})
	.attr("transform", function(d){

	    if (d['name'] == 'before and after'){
		return;
	    }

	    var x = scale(d);
	    var y = 183;
	    var parts = [-90, x, y].join(",");
	    return "rotate(" + parts + ")";
	})
	.style("text-anchor", "center")
	.attr("id", function(d){
	    return "date-" + d;
	})
	.attr("class", function(d){
	    return "timeline-event timeline-event-year"
	});
};

timeline.prototype.draw_endings = function(){

    var self = this;
    var scale = this.scale;

    this.svg.selectAll("text-endings")
	.data(this.endings)
	.enter()
	.append("text")
	.text(function(d){

	    if (! self.evt){
		return d;
	    }

	    var end = self.evt['end'];

	    if (! end){
		return d;
	    }

	    var dist = (end < d) ? (scale(d) - scale(end)) : (scale(end) - scale(d));
	    var show = (dist >= 16) ? 1 : 0;

	    return (show) ? d : "";
	})
	.attr("x", function(d, i){
	    d = scale(d) - 12;
	    return d;
	})
	.attr("y", function(d, i){
	    return 195;
	})
	.attr("transform", function(d){
	    if (d['name'] == 'before and after'){ return; }
	    var x = scale(d);
	    var y = 183;
	    var parts = [-90, x, y].join(",");
	    return "rotate(" + parts + ")";
	})
	.style("text-anchor", "center")
	.attr("id", function(d){
	    return "date-" + d;
	})
	.attr("class", "timeline-event timeline-event-year-ending");
};

timeline.prototype.draw_ctx = function(){

    var self = this;
    var scale = this.scale;
    var h = this.h;

    var on_mouseover = function(d){

	if (d['name'] == 'before and after'){
	    return;
	}

	var start = d['start'];
	var end = d['end'];

	var start_date = d3.select("#date-" + start);
	var classes = start_date.attr("class");
	start_date.attr("class", classes + " timeline-event-year-hover");

	var end_date = d3.select("#date-" + end);
	var classes = end_date.attr("class");
	end_date.attr("class", classes + " timeline-event-year-hover");

	self.draw_event_span(start, end);

	if (self.evt){

	    var start = self.evt['start'];
	    var end = self.evt['end'];
	    var echo = self.evt['echo'];

	    if ((self.draw_evt_span()) && (self.does_overlap(start, end, d['start'],d['end']))){
		var hover_start = (d['start'] > start) ? d['start'] : start;
		var hover_end = (d['end'] < end) ? d['end'] : end;
		self.draw_span_block(hover_start, hover_end, "hover-block");
	    }

	    else if ((start) && (self.is_between(d['start'], d['end'], start, 6))){
		self.draw_arrow(start, "hover-arrow-start-" + start, "youarehere");
	    }

	    if ((echo > self.min) && (echo < self.max) && (self.is_between(d['start'], d['end'], echo, 6))){
		self.draw_arrow(echo, "hover-arrow-echo-" + echo, "echo");
	    }

	}

    };

    var on_mouseout = function(d){

	if (d['name'] == 'before and after'){
	    return;
	}

	var start = d['start'];
	var end = d['end'];

	var rect = "#span-" + start + "-" + end + "-rect";
	$(rect).remove();

	var start_date = d3.select("#date-" + start);
	var classes = start_date.attr("class").replace("timeline-event-year-hover", "");
	start_date.attr("class", classes);

	var end_date = d3.select("#date-" + end);
	var classes = end_date.attr("class").replace("timeline-event-year-hover", "");
	end_date.attr("class", classes);

	if (self.evt){

	    var start = self.evt['start'];
	    var echo = self.evt['echo'];

	    self.remove_arrow("hover-arrow-start-" + start);
	    self.remove_arrow("hover-arrow-echo-" + echo);
	    $("#hover-block").remove();
	}
    };

    this.svg.selectAll("text-ctx")
	.data(this.ctx)
	.enter()
	.append("text")
	.text(function(d){
	    if (d['name'] == 'before and after'){
		return;
	    }
	    return d['name'];
	})
	.attr("x", function(d, i){
	    return self.scale(d['start']) - 15;
	})
	.attr("y", function(d, i){
	    return 110;
	})
	.on('mouseover', on_mouseover)
	.on('mouseout', on_mouseout)
	.style("text-anchor", "center")
	.attr("transform", function(d){

	    if (d['name'] == 'before and after'){
		return;
	    }

	    var x = scale(d['start']);
	    var y = h - 100;
	    var parts = [-90, x, y].join(",");
	    return "rotate(" + parts + ")";
	})
	.attr("class", "timeline-event timeline-event-item");

};

timeline.prototype.draw_evt = function(){

    if (! this.evt){
	return;
    }

    // sudo put me in a function (see below)

    var evt_start = this.evt['start'];
    var evt_end = this.evt['end'];

    var start = evt_start;
    var end = evt_end;

    if (start < this.min){
	start = this.min - (this.padding / 2);
    }

    if (evt_end == 0){
	var dt = new Date();
	end = dt.getYear() + 1900;
    }

    else if (end > this.max){
	end = this.max + (this.padding / 2);
    }
    
    else {}

    //

    var x = this.scale(start);
    var transform = this.rotation_for_date;

    var dist_end = (this.scale(start) - this.scale(end));
    var show_end = ((dist_end <= -16) || (dist_end >= 16)) ? 1 : 0;

    var show_acq = null;

    if (this.evt['echo']){
	var dist_acq = (start < this.evt['echo']) ? (this.scale(start) - this.scale(this.evt['echo'])) : (this.scale(this.evt['echo']) - this.scale(start));
	show_acq = ((dist_acq < 0) || (dist_acq >= 16)) ? 1 : 0;
    }

    if (evt_start){
	
	this.svg.append("text")
	    .text(evt_start)
	    .attr("x", x - 5)
	    .attr("y", 195)
	    .attr("transform", function(d){
		var y = 190;
		var parts = [-90, x, y].join(",");
		return "rotate(" + parts + ")";
	    })
	    .style("text-anchor", "center")
	    .attr("class", "timeline-event timeline-event-evt timeline-evt-start");
    }

    if ((evt_end) && (evt_end != evt_start) && (evt_end > this.min) && (show_end)){

	var x = this.scale(end);

	this.svg.append("text")
	    .text(evt_end)
	    .attr("x", x - 5)
	    .attr("y", 195)
	    .attr("transform", function(d){
		var y = 190;
		var parts = [-90, x, y].join(",");
		return "rotate(" + parts + ")";
	    })
	    .style("text-anchor", "center")
	    .attr("class", "timeline-event timeline-event-year-ending timeline-event-evt timeline-event-evt-end");

    }

    if ((this.evt['echo']) && (this.evt['echo'] != evt_start) && (show_acq)){

	var x = this.scale(this.evt['echo']);

	this.svg.append("text")
	    .text(this.evt['echo'])
	    .attr("x", x - 5)
	    .attr("y", 195)
	    .attr("transform", function(d){
		var y = 190;
		var parts = [-90, x, y].join(",");
		return "rotate(" + parts + ")";
	    })
	    .style("text-anchor", "center")
	    .attr("class", "timeline-event timeline-event-evt timeline-evt-start");
    }

    if (this.draw_evt_span()){
	this.draw_span_line(start, end);
	this.draw_span_block(start, end);
    }

    else if (evt_start){
	this.draw_arrow(start, "youarehere");
    }

    else {}

    if (this.evt['echo']){
	this.draw_arrow(this.evt['echo'], "echo", "echo");
    }
    
};

timeline.prototype.draw_arrow = function(year, id, extra_classes){

    var classes = [
	"youarehere"
    ];

    if (year < this.min){
	classes.push("youarehere-before");
    }

    if (year > this.max){
	classes.push("youarehere-after");
    }

    classes = classes.join(" ")

    if (extra_classes){
	classes += " " + extra_classes;	// no, not like this...
    }

    var x1 = this.scale(year);
    var x2 = x1;

    var h = this.h;

    // sudo make me one shape or a group or something
    // (20130918/straup)

    this.svg.append("line")
 	.attr("id", id + "-shaft")
	.attr("x1", x1)
	.attr("x2", x2)
	.attr("y1", h - 75)
	.attr("y2", h - 45)
	.attr("class", classes);
		
    var path = [
	"M" + (x1 - 6) + "," + (h - 53),
	"L" + (x1) + "," + (h - 46),
	"L" + (x1 + 6) + "," + (h - 53),
	"Z"
    ];
		
    this.svg.append("path")
 	.attr("id", id + "-head")
	.attr("d", path.join(" "))
	.attr("class", classes);
}

// This is a hack to account for the fact that the arrow isn't
// a proper shape (20130918/straup)

timeline.prototype.remove_arrow = function(id){

    $("#" + id + "-head").remove();
    $("#" + id + "-shaft").remove();
};

timeline.prototype.draw_event_span = function(start, end, id){

    var id = "span-" + start + "-" + end + "-rect";

    var x1 = this.scale(start);
    var x2 = this.scale(end);
    var h = this.h;

    var width = x2 - x1;
	
    this.svg.append("rect")
	.attr("id", id)
	.attr("x", x1)
	.attr("y", h - 75)
	.attr("height", 35)
	.attr("width", width)
	.attr("class", "timeline-span-rect");

};

timeline.prototype.draw_span_line = function(start, end){
  
    var x1 = this.scale(start);
    var x2 = this.scale(end);
	
    this.svg.append("line")
	.attr("id", "thing")
	.attr("x1", x1)
	.attr("x2", x2)
	.attr("y1", this.h - 39)
	.attr("y2", this.h - 39)
	.attr("class", "timeline-span-line");
};

timeline.prototype.draw_span_block = function(start, end, id){

    if (! id){
	id = "span-" + start + "-" + end + "-block";
    }

    var x1 = this.scale(start);
    var x2 = this.scale(end);
    var h = this.h;

    var width = x2 - x1;
	
    this.svg.append("rect")
	.attr("id", id)
	.attr("x", x1)
	.attr("y", h - 75)
	.attr("height", 35)
	.attr("width", width)
	.attr("class", "timeline-item");

};

timeline.prototype.does_overlap = function(a1, a2, b1, b2){

    if ((a2 > b1) && (a2 < b2)){
	return 1;
    }

    if ((a1 > b1) || (a2 > b2)){
	return 1;
    }

    if ((a1 < b1) && (a2 > b2)){
	return 1;
    }

    if ((a1 < b1) && (a2 > b2)){
	return 1;
    }

    // console.log("does overlap a1:" + a1 + " a2:" + a2 + " b1:" + b1 + " b2:" + b2 + " NO");
    return 0;
};

timeline.prototype.is_between = function(start, end, date, offset) {

    if (offset){
	start = this.scale(start) - offset;
	end = this.scale(end) + offset;
	date = this.scale(date);
    }

    var btwn = ((date >= start) && (date <= end)) ? 1 : 0;
    // console.log("is " + date + " between " + start + " - " + end + " :" + btwn);

    return btwn;
};

timeline.prototype.draw_evt_span = function(){

    // sudo put me in a function

    var evt_start = this.evt['start'];
    var evt_end = this.evt['end'];

    var start = evt_start;
    var end = evt_end;

    if (start < this.min){
	start = this.min - (this.padding / 2);
    }

    if (evt_end == 0){
	var dt = new Date();
	end = dt.getYear() + 1900;
    }

    else if (end > this.max){
	end = this.max + (this.padding / 2);
    }
    
    else {}

    //

    var draw_span = 0;

    if ((evt_start) && (start != end) && (end)){
	draw_span = 1;
    }

    if ((draw_span) && (evt_start < this.min) && (evt_end < this.min)){
	draw_span = 0;
    }

    if ((draw_span) && (this.is_between(this.before, this.min, evt_start)) && (this.is_between(this.before, this.min, evt_end))){
	draw_span = 0;
    }

    if ((draw_span) && (evt_start < this.before) && (evt_end < this.before)){
	draw_span = 0;
    }

    if ((draw_span) && (this.is_between(this.max, this.after, evt_start)) && (this.is_between(this.max, this.after, evt_end))){
	draw_span = 0;
    }

    if ((draw_span) && (evt_start > this.after) && (evt_end > this.after)){
	draw_span = 0;
    }

    return draw_span;
};
