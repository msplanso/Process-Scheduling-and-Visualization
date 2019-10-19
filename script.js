
	var datasource = "data.json";
	var x_start = 80;
	var y_stage = 0;
	var x_recipe = [80, 80];
	var x_stage = [80, 80];
	var pt = 0;
	var color = "rgb(255,110,180)";
	var color_library = ["rgb(0,191,255)", "rgb(255,255,0)", "rgb(255,110,180)", "rgb(0,255,0)", "rgb(255,127,36)", "rgb(170,128,255)", "rgb(102,255,153)", "rgb(255,102,102)", "rgb(83,140,198)"];
	var gc_order = 0;
	var index=0;
	var data_index = [];
	var del_index;
	var delete_index;
	var st_point = [];
	var str_point;
	var c=0;
	var b=0;
	var j = 0;
	var a = 0;
	var initial_add_timeline = true;
	var gantchart = [
										{
											id: "g0_0", 
											start_point: 0, 
											operating_stage: 0, 
											recipe:0, 
											processing_time: 0
										}
									];
	
	function datasource_define() {
		datasource = $(".select_data option:selected").val();
		init();
		$(".visual_display").empty();
		$(".gann_chart").empty();
		
		setTimeout(function (){	
			load_all();
		}, 300);
	}

	function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', datasource, true); // Replace 'data' with the path to your file
    xobj.onreadystatechange = function () {
	    if (xobj.readyState == 4 && xobj.status == "200") {
	      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
	      callback(xobj.responseText);
	    }
    };
    xobj.send(null);  
  }

	function init() {
		$(".table_body").html("");
		$(".table_head").html("");
		loadJSON(function(response) {
			//Parse JSON string into object
		  actual_JSON = JSON.parse(response);

		  level = actual_JSON;
		  //all the data.json objects have been stored into the actual_JSON
		  layout = actual_JSON.layout;
		  stage = actual_JSON.stage;
		  agv = actual_JSON.agv;
		  vessel = actual_JSON.vessel;
		  recipe = actual_JSON.recipe;	    
		  var t_body = "";
		  var t_head = "";
		  var t_head_count = 0;
		      
		  //document.getElementById("demo").innerHTML=actual_JSON.recipe[1].step[0].Name;
		  for(var i=0; i<layout.recipeNum; i++){
		  	x_recipe.push(80);
		  };
		  
		  t_head = "<tr>";
		  t_head += "<th id='recipe'></th>";
		  for(var j=0; j<layout.maxStep; j++){
		  	x_stage.push(80);
		  	t_head += "<th id='recipe'>Step"+j+"</th>";
		  };
		  t_head += "</tr>";	    
		  $(".table_head").append(t_head);	    
		  for(var k=0; k<layout.recipeNum; k++){
		  	
		  	var t_body_tr = "";
		  	var t_body_td = "<tr>";
		  	t_body_td += "<td style='font-size:12px;text-align:center;'>Recipe "+k+"</td>";
		  	for(var l=0; l<recipe[k]["stepNum"]; l++){
		  		t_body_td += "<td><div style='text-align:center;' title='Processing Time: "+recipe[k]["step"][l]["processingTime"]+"' class='recipe_data' id='s"+k+"_"+l+"' ondrag = 'setvar(this)' >"+recipe[k]["step"][l]["Name"]+"</div></td>";
		  	
		  	}
		  	t_body_td += "</tr>";
		  	t_body += t_body_td;
		  }
			$(".table_body").append(t_body);
			$(".recipe_data").draggable({			
				//helper:"clone",
				//helper: "original",
				helper: function( event ) {
					var racipe_name = $(this).html();
					var background_color = $(this).css("background-color");
	        return $( "<div style='background-color:"+background_color+"; padding:10px; width:105px;' class=''>"+racipe_name+"</div>" );
	      },
				//cursorAt: { top: 25, left: 25 },
				revert: true
			});
			$( "#footer_left" ).droppable();

		});
	}

	function recipeNumfromID(pointID1){
		var id_Num=$(pointID1).attr("id");
		return id_Num.substring(1,2);

	}

	function stepNumfromID(pointID2){
		var id_Num=$(pointID2).attr("id");
		var stepNumber = id_Num.split("_").pop();
		return stepNumber;
	}

	function displayover(){
		
	}
	
	function setvar(ob){		
		var id_Num=$(ob).attr("id");
		recipe_Num = recipeNumfromID(ob);
		step_Num = stepNumfromID(ob);
		
		gantchart_id = "g"+recipe_Num+'_'+step_Num;
		gantchart[gc_order].operating_stage = recipe[recipe_Num].step[step_Num].stage;
		gantchart[gc_order].recipe = recipe_Num;
		pt = recipe[recipe_Num].step[step_Num].processingTime*5;
		document.getElementById(id_Num).style.background = 'gray';
		color = color_library[recipe_Num];
		var Number_of_row = recipe[recipe_Num].step[step_Num].stage;
		y_stage = 25*Number_of_row + 25;
		
		if(x_recipe[recipe_Num]>=x_stage[recipe[recipe_Num].step[step_Num].stage]){
			x_start = x_recipe[recipe_Num];
		}
		else{
			x_start = x_stage[recipe[recipe_Num].step[step_Num].stage];
		}
	}

	function updatex(){
		x_recipe[recipe_Num] = x_start+pt;
		x_stage[recipe[recipe_Num].step[step_Num].stage] = x_start+pt;
	}

	function dragmove(d) {
	    d3.select(this).attr("x", Math.round((d3.event.x-80)/10)*10+80);
	      //.attr("y", d3.event.y)
	      
	    gc_id_Num = d3.select(this).attr("id");
	    new_start_point = Math.round((d3.event.x-80)/25)*5;
		var i = 0;
		while(gantchart[i].id!=gc_id_Num){
			//gantchart[i].start_point = new_start_point;
			i++;
		};
		gantchart[i].start_point = new_start_point;
	}

	var drag = d3.behavior.drag().on("drag", dragmove);

	function insert(){	
		layout_insert=true;
		var bodySelection = d3.select(".chart");
		var circleSelection = bodySelection.append("rect")
		                                   .attr("x", this.x_start)
		                                   .attr("y", this.y_stage)
		                                   .attr("width", this.pt)	             
		                                   .attr("height", 25)
		                                   .attr("id",this.gantchart_id)	                
		                                   .style("fill", this.color)
		                                   .call(drag)	                               
		                                   .on("contextmenu", remove);
		gantchart[gc_order].id = this.gantchart_id;
		gantchart[gc_order].start_point = (this.x_start-80)/5;
		gantchart[gc_order].processing_time = this.pt/5;
		index = index+1;
		gantchart.unshift({id: gantchart[gc_order].id, start_point: gantchart[gc_order].start_point, index, operating_stage: gantchart[gc_order].operating_stage, recipe:gantchart[gc_order].recipe, processing_time: gantchart[gc_order].processing_time});
		gc_order = gc_order+1;

		function remove(){
				
			d3.event.preventDefault();
			d3.select(this).remove();
			var deleted_id = d3.select(this).attr("id");
			var deleted_recipe = recipeNumfromID(this);
			var deleted_step = stepNumfromID(this);
			var back_color = color_library[deleted_recipe];
			var deleted_recipe_id = "s"+ deleted_recipe+'_'+deleted_step
			document.getElementById(deleted_recipe_id).style.background = back_color;
		  var j = 0;
			do{			
			   del_id = d3.select(this).attr("id");
			   if(del_id == gantchart[j].id){
				
						del_index = gantchart[j].index;
						data_index.push(del_index);
						break;
				 }else{						
						j++;
				}
	   
			}
			while(j<=1000) 
			return data_index;

		}
		
	}

	function gant_chart(){
		//var stage = ["Liquid_A","Liquid_B","Mix","Heat","Discharge","Clean"];
		var total_length = 0;
		for (var sum_recipe = 0; sum_recipe < layout.recipeNum; sum_recipe++){
			for(var sum_step = 0; sum_step < recipe[sum_recipe].stepNum; sum_step++){
				total_length = total_length + recipe[sum_recipe].step[sum_step].processingTime;
			}
		}

		var gap = 25;
		//function go(){
		var x = d3.scale.linear().domain([0, total_length]).range([0, total_length*5]);
		    
		var y = d3.scale.linear().domain([0, layout.stageNum*10]).range([0, layout.stageNum*25]);
		     								 
		var chart = d3.select("#footer_left").append("svg")
																		     .attr("class", "chart")
																		     .attr("width", total_length*5+100)
																		     .attr("height", layout.stageNum*25+60)
																				 .append("g")
																		     .attr("transform", "translate(80,25)");

		chart.selectAll("line.x")
		     .data(x.ticks(Math.round(total_length/2)))
			   .enter().append("line")
		     .attr("class", "x")
		     .attr("x1", x)
		     .attr("x2", x)
		     .attr("y1", 0)
		     .attr("y2", layout.stageNum*25)
		     .style("stroke", "#ccc");

		chart.selectAll("line.y")
		     .data(y.ticks(layout.stageNum))
				 .enter().append("line")
		     .attr("class", "y")
		     .attr("x1", 0)
		     .attr("x2", total_length*5)
		     .attr("y1", y)
		     .attr("y2", y)
		     .style("stroke", "#ccc");

		chart.selectAll(".rule")
		     .data(x.ticks(Math.round(total_length/4)))
				 .enter().append("text")
		     .attr("x", x)
		     .attr("y", 0)
		     .attr("dy", -3)
		     .attr("text-anchor", "middle")
		     .attr("font-family", "arial")
		     .text(String);
		
		for(var i=0;i<layout.stageNum;i++){
			chart.selectAll(".rule")
		    	 .data(y.ticks(layout.stageNum))
					 .enter().append("text")
		   		 .attr("x", 0)
		     	 .attr("y", (i+1)*gap)
		     	 .attr("dy", -5)
		    	 .attr("dx", -3)
		    	 .attr("text-anchor", "end")
		    	 .attr("font-family", "arial")
		    	 .text(stage[i].Name);

			chart.selectAll(".rule")
			     .data(x.ticks(1))
				   .enter().append("text")
			     .attr("x", 110)
			     .attr("y", layout.stageNum*25+25)
			     .attr("dy", -3)
			     .attr("text-anchor", "middle")
			     .attr("font-family", "arial")
			     .text("Manually Scheduled");

			chart.selectAll(".rule")
				   .data(x.ticks(1))
			   	 .enter().append("text")
					 .attr("x", 300)
					 .attr("y", layout.stageNum*25+25)
					 .attr("dy", -3)
					 .attr("text-anchor", "middle")
					 .attr("font-family", "arial")
					 .text("FCFS Scheduled");

			chart.selectAll(".rule")
					 .data(x.ticks(1))
					 .enter().append("text")
					 .attr("x", 490)
					 .attr("y", layout.stageNum*25+25)
					 .attr("dy", -3)
					 .attr("text-anchor", "middle")
					 .attr("font-family", "arial")
					 .text("SDFS Scheduled");
		
		};
		
		chart.append("line")
		     .attr("y1", 0)
		     .attr("y2", layout.stageNum*25)
		     .style("stroke", "#000");

		chart.append("line")
		     .attr("x1", 0)
		     .attr("x2", total_length*5)
		     .style("stroke", "#000");
	} 	

	function add_Markline(){
		var buildmarkline = d3.select(".chart");
		var line_manual_schedule = buildmarkline.append("line")
																						.attr("id","line_manual" )
																						.attr("x1",80)
																						.attr("y1",layout.stageNum*25+40)
																						.attr("x2",130)
																						.attr("y2",layout.stageNum*25+40);
		var line_FCFS_solution = buildmarkline.append("line")
																					.attr("id","line_fcfs" )
																					.attr("x1",280)
																					.attr("y1",layout.stageNum*25+40)
																					.attr("x2",330)
																					.attr("y2",layout.stageNum*25+40);
		var line_FCFS_solution = buildmarkline.append("line")
																					.attr("id","line_sdfs" )
																					.attr("x1",470)
																					.attr("y1",layout.stageNum*25+40)
																					.attr("x2",520)
																					.attr("y2",layout.stageNum*25+40);

	}

	function add_Line(Pos){
		//d3.select("line1").remove();
		var lineSelection = d3.select(".chart");
		var linecir = lineSelection.append("line")
															 .attr("id","line1" )
						                   .attr("x1",Pos)
						                   .attr("y1",25)
						                   .attr("x2",Pos)
						                   .attr("y2",layout.stageNum*25+25);		   
	}	  
	 
	var x_timeline=1080;
	function stopAnimation() {
		if(timeVar_wait != null){
			clearTimeout(timeVar_wait);
			timeVar_wait = null;
		}
	}
	
	function timeline_animate(increment) {
		var line = document.getElementById("line1");
		var x1_timeline = line.getAttribute("x1");
		var x2_timeline = line.getAttribute("x2");
		var newX1 = 0.5 + parseFloat(x1_timeline);
		var newX2 = 0.5 + parseFloat(x2_timeline);
		if(newX1 > x_timeline) {
			newX1 = x_timeline;
			//newX1 = stopAnimation();
		}
		if(newX2 > x_timeline) {
			newX2 = x_timeline;
			//newX2 = stopAnimation();
		}
		line.setAttribute("x1", newX1);
		line.setAttribute("x2", newX2);
	}

  function getSvgSize(gridSize, squareWidth, squareHeight) {
    var width = gridSize.x * squareWidth;
    var height = gridSize.y * squareHeight;
    return { width:width, height:height };
  }

	function isStage(x,y,level){	
		for(var i=0;i<level.layout.stageNum;i++){		
			var yn= level.stage[i].Position_y;
			var xn= level.stage[i].Position_x; 
			if(xn==x && yn==y)
			{
				//return level.stage[i].Name;
				return level.stage[i].ID;
			}
		}
		return -1;
	}

	function buildMap(gridSize, level){

	  var map = { gridm:[], grass:[], rock:[], lava:[] };
	  var x;
	  var y;
	  for(var i=0; i<level.layout.stageNum;i++)
	  {
	  	map["lava"][i]={};
	  }
	  for (x = 0; x < gridSize.x; x++) {
			map.gridm[x] = [];
			for (y = 0; y < gridSize.y; y++){

				var type ="grass"

				var id=isStage(x,y,level)
				if(id!=-1){
					type="lava";
					var cell = { x:x, y:y , type:type};
					map.gridm[x][y]=cell;
					map[type][id]=cell;
				}else{
								
					var cell = { x:x, y:y , type:type};

					map.gridm[x][y] = cell;
					map[type].push(cell); 
				}
			}

		}
	  return map;
	}

  function getScale(gridSize, svgSize) { 
 
    var xScale = d3.scale.linear().domain([0,gridSize.x]).range([0,svgSize.width]);
    var yScale = d3.scale.linear().domain([0,gridSize.y]).range([0,svgSize.height]);
    return { x:xScale, y:yScale };
  }

  function drawCells(svgContainer, scales, data, cssClass,squareHeight) {
    var gridGroup=svgContainer;
    if(cssClass!="occupied"){
    	var gridGroup = svgContainer.append("g");
  	}
    var cellsdata = gridGroup.selectAll("rect").data(data);
                
    cellsdata.remove();
    cellsdata=gridGroup.selectAll('rect').data(data);
                
    var cells= cellsdata.enter().append("rect");
                                
    var cellAttributes = cells
             .attr("x", function (d) { return scales.x(d.x); })
             .attr("y", function (d) { return scales.y(d.y); })
             .attr("width", function (d) { return squareWidth; })
             .attr("height", function (d) { return squareHeight; })
             .attr("class", cssClass);

    if(cssClass=="unoccupied"){   
    	var textData = gridGroup.selectAll("text").data(data);                      	
			textData.remove();
 			textData=gridGroup.selectAll('text').data(data);
                		
			var texts = textData.enter().append("text");
			var textAttributes = texts
         		.attr("x", function (d) { return scales.x(d.x + 0.5); })
         		.attr("y", function (d) { return scales.y(d.y + 0.5); })
         		.attr("dy", ".31em")
         		.text(function(d,i) { return level.stage[i].ShortName;  })
         		.attr("font-family", "arial")
         		.attr("class", "positionNumber");
    }
  }
	  
  function drawMowerHistory(groups, scales, path) {
    var circleData = groups.position.selectAll("circle").data(path);
    circleData.remove();
    var circles = circleData.enter().append("circle");
    
    var circleAttributes = circles
             .attr("cx", function (d) { return scales.x(d.x + 0.5); })
             .attr("cy", function (d) { return scales.y(d.y + 0.5); })
             .attr("r", function (d) { return circleRadius; })
             .attr("class", "position");
             
    var textData = groups.position.selectAll("text").data(path);
    textData.remove();
    var texts = textData.enter().append("text");
    var textAttributes = texts
             .attr("x", function (d) { return scales.x(d.x + 0.5); })
             .attr("y", function (d) { return scales.y(d.y + 0.5); })
             .attr("dy", ".31em")
             .text(groups.id)
             .attr("font-family", "arial")
             .attr("class", "positionNumber");
  }
	
	function drawagv(groups, scales, data, color){ 
		var rectData=groups.position.selectAll('rect').data(data);		            
		rectData.remove();
		rectData=groups.position.selectAll('rect').data(data);		           
		var rects=rectData.enter().append("rect");
		var rectAttributes = rects
		          .attr("x", function (d) { return scales.x(d.x + 0.3); })
		        	.attr("y", function (d) { return scales.y(d.y +0.3); })
		        	.attr("width", function (d) { return agvLength; })
		        	.attr("height", function (d) { return agvLength; })
		        	.attr("class", color);

		var textData = groups.position.selectAll("text").data(data);
		textData.remove();
		textData = groups.position.selectAll("text").data(data);
		var texts = textData.enter().append("text");
		var textAttributes = texts
		         .attr("x", function (d) { return scales.x(d.x + 0.5); })
		         .attr("y", function (d) { return scales.y(d.y + 0.5); })
		         .attr("dy", ".31em")
		         .text(groups.id)
		         .attr("font-family", "arial")
		         .attr("class", "positionNumber");
	}

	function haupt_animation(){

	 	//Check if animation is valid
	 	makespan=0;
	 	if(layout_insert==true){
	 		layout_insert=false;
	 	}
	 	
		gantchart.reverse();
		for (a=0; a<data_index.length; a++)
		{
		    delete_index = data_index[a];
		    gantchart.splice(delete_index,1)

		} 
		gantchart.reverse();
		if(check_gant(gantchart,0,"validity")==-1)
		{
			return;
		};
		if(initial_add_timeline == true){
			add_Line(80);
			initial_add_timeline = false;
		};

		var start_agv={};		
		//start points of AGV's
		for (var ind = 0; ind < level.layout.agvNum; ind++){ 		  
		  start_agv[ind]= map.gridm[level.agv[ind].Position_x][level.agv[ind].Position_y];
		}

		//making the groups of vessels 		
		var prev_time=0;
		var path_var=[];
		var current=[];
		var next=[];
		var layout_i=0;
		var layout_j=0;
		var free=0;
		var path=[];
		//var timeVar_wait=0; 
		var animation="false";

		test();
		function animate(){					  
			var length=0;
			//find the longest path, which would be the total time for a simultaneous animation
			for(var i=0;i<path.length;i++){			
				var temp=path[i].route.length;
				if(temp>length){				
					length=temp;
				}
			}				
			//finish condition
			if(layout_i>=length){ 			
				layout_j=0;
				layout_i=0;
				path=[];
				//clearTimeout(timeVar);
				animation="false";
				//set all the agv's free
				for(var ind=0; ind<Object.keys(groups_agv).length; ind++){				
					drawagv(groups_agv[ind], scales, [start_agv[ind]],"position_free");
					level.agv[ind].Occupied=0;
				}
				return;
			}

		  var x=[];
		  var y=[];
		  for(var i=0;i<layout_j;i++){	  
		  	x[i]= level.vessel[path[i].recipe].Position_x;
	      y[i]= level.vessel[path[i].recipe].Position_y;

	      current[i]=map.gridm[x[i]][y[i]];
	      //Do not calculate next path if the destination has been reached 
        if(layout_i<path[i].route.length){ 
        
       		if(path[i].route[layout_i]=="North"){ 
         	  next[i]= map.gridm[current[i].x][current[i].y-1];
         	}
    		 	if(path[i].route[layout_i]=="South"){         	 
         		next[i]= map.gridm[current[i].x][current[i].y+1];
         	}
        	if(path[i].route[layout_i]=="East"){ 
       		  next[i]= map.gridm[current[i].x+1][current[i].y];
       		}
       		if(path[i].route[layout_i]=="West"){ 
       		  next[i]= map.gridm[current[i].x-1][current[i].y];
       		}

     			path_var[i]=[];
     		 	path_var[i][0]=current[i];
        	path_var[i][1]=next[i];

        	level.vessel[path[i].recipe].Position_x=next[i].x;
          level.vessel[path[i].recipe].Position_y=next[i].y;
          current[i] = next[i];

        }else{
                
         	path_var[i]=[];
     		  path_var[i][0]=current[i];
        	path_var[i][1]=current[i]; //stay at the same place 
        }
	       
	      drawMowerHistory(groups_vessel[path[i].recipe], scales, path_var[i]);
		  }        
			      		    
			layout_i=layout_i+1;		      
		  //timeVar=setTimeout(animate, 100);
		 
		}

	  //on animate click function
		function test() {			 
	    mobility=check_gant(gantchart,time,mobility,"animate");	   
	    //now we extract the points from the mobility block. The output should be a list of a set of points 
	    //for the transfers to be carried out at a particular time. The structured of the returned path should be 
	    //similar to the hard-coded one
	    for(var a=0;a<level.layout.vesselNum;a++){	    
		    if(mobility[a].enter=="true" && mobility[a].exit=="false" && animation=="false"){      
	        var start=[];
	        start[0]=mobility[a].x_pos;
	        start[1]=mobility[a].y_pos;
	        var goal=[];
	        goal[0]=level.stage[mobility[a].stage].Position_x;
	        goal[1]=level.stage[mobility[a].stage].Position_y;
	        path[layout_j]={};
	        path[layout_j].route=[];
	        //THis condition should never be violated as it should be filtered as infeasible in the beginning        
	        if(layout_j<level.layout.agvNum) {
	         	drawagv(groups_agv[layout_j], scales, [start_agv[layout_j]],"position_busy");
		      	level.agv[layout_j].Occupied=1;
		      }
		      
		      level.vessel[layout_j].Occupied=1;
	        path[layout_j].route=findShortestPath(start, goal, map,start_vessel,start_agv);
	        path[layout_j].recipe=a;
	        path[layout_j].stage=mobility[a].stage;
					//set the stage to busy WITH the recipe
	        level.stage[path[layout_j].stage].Occupied=path[layout_j].recipe+1;
	        //set the speed of level progress according to the length of the path
	        //set up hard bound on height drawing if it has not reached its full potential. Sometimes due to floating points the height from the previous step is not always zero
	        if(stage_height[path[layout_j].stage]!=0){
	        	stage_height[path[layout_j].stage]=0;
	        }
					stage_progress[path[layout_j].stage]=0.1*squareHeight/mobility[path[layout_j].recipe].processing_time;

					layout_j=layout_j+1;
			 		mobility[a].enter="false";//so it doesnt enter the path finding again unless directed by check_gant
	      }
	     
	      if(mobility[a].enter=="false" && mobility[a].exit=="true" && animation=="false"){
	     			      	
	        var start=[];
	        start[0]=mobility[a].x_pos;
	        start[1]=mobility[a].y_pos;
	        var goal=[];
	        goal[0]=start_vessel[a].x;
	        goal[1]=start_vessel[a].y;
	        path[layout_j]={};
	        path[layout_j].route=[];
	        //THis condition should never be violated as it should be filtered as infeasible in the beginning
	        if(layout_j<level.layout.agvNum){			         
	          drawagv(groups_agv[layout_j], scales, [start_agv[layout_j]],"position_busy");
		      	level.agv[layout_j].Occupied=1;
		      }     
		      level.vessel[layout_j].Occupied=1;
	        path[layout_j].route=findShortestPath(start, goal, map,start_vessel,start_agv);
	        path[layout_j].recipe=a;
	        layout_j=layout_j+1;        
	        mobility[a].exit="false";//so it doesnt enter the path finding again unless directed by check_gant
	     
	      }

	    }

	    if(path.length>0){
	    	animation="true";
	    }
	    for(var a=0;a<level.layout.stageNum;a++){
	    		    		
    		stage_height[a]=stage_height[a]+stage_progress[a];
    		if(stage_height[a]>=squareHeight){ 		
    			//drawMowerHistory(groups_vessel[level.stage[a].Occupied-1], scales, [start_vessel[0],start_vessel[0]])
    			stage_height[a]=0;
    			stage_progress[a]=0;
    			var cellsdata = stages[a].selectAll("rect").data([map.lava[a]]);               
          cellsdata.remove();   			
    		}
    		if(stage_height[a]>0){
    			drawCells(stages[a], scales, [map.lava[a]], "occupied",stage_height[a]);
    		}
	    		
			}
	    
	    if(animation=="true"){	    	
	    	layout_j=path.length;
	      animate();	     
	      //code for toggling color of stages
			}
			 	
			time=time+0.1;
			time = Math.round( time * 10 ) / 10;

			if(time<makespan){			
				timeline_animate();
			}
			if(time==makespan){
				for(var ind=0;ind<Object.keys(mobility).length;ind++){
				
					mobility[ind].x_pos=level.vessel[ind].Position_x;
					mobility[ind].y_pos=level.vessel[ind].Position_y;
					mobility[ind].enter="false";
					mobility[ind].exit="true";
				}
			}
			if(time>200){
			
				time=0;
				clearTimeout(timeVar_wait);
				return;
			}

			timeVar_wait=setTimeout(test,100);
			    			    
		}
		  
	}

	function check_gant(gantchart,time,mobility,condition){
		var escape=false;		
		var count=0;		
		//calculations of makespan
		//the last possible simeltaneous recipes in our gantt chart may have different processing times. Check the longest
				
		while(escape!=true){		
			if(condition=="animate"){		
				escape=true;
				count=0;
			}
			else{ 
				//we need to refresh mobility at every cicle because we want to see feasability. Clearing is necessary because of count condition. But if we are
				//animating, mobility needs to stay put until the paths have been traversed
				var mobility={}; // Main variable. at each transition in time, it is updated and shows which recipe is moving where.
				for(var ind=0;ind<level.layout.vesselNum;ind++){			
			  	mobility[ind]={enter:"false", exit:"false"};
				}
				count=0;
			}
			
			for (var a=0;a<gantchart.length-1;a++){	    	
	      //compare the time with the start time of each block	     
	      if(time==gantchart[a].start_point){	     		
	        //remember to initialize mobility after every transition time
      		mobility[gantchart[a].recipe].enter="true";
      		var x=level.vessel[gantchart[a].recipe].Position_x;
      		var y=level.vessel[gantchart[a].recipe].Position_y;
      		mobility[gantchart[a].recipe].x_pos=x;
      		mobility[gantchart[a].recipe].y_pos=y;
      		//if the recipe was already occupying a stage, clear that stage
      		if(mobility[gantchart[a].recipe].stage!=null){     		
      			level.stage[mobility[gantchart[a].recipe].stage].Occupied=0;
      		}
      		mobility[gantchart[a].recipe].stage=gantchart[a].operating_stage;
      		mobility[gantchart[a].recipe].processing_time=gantchart[a].processing_time;

      		var recipe=level.stage[gantchart[a].operating_stage].Occupied-1;
      		//if the goal stage is already occupied. This condition should only be executed if the vessel has nowhere else to go
      		
      		if(level.stage[gantchart[a].operating_stage].Occupied!=0){
         			     			
      			mobility[level.stage[gantchart[a].operating_stage].Occupied-1].exit="true";
      			mobility[level.stage[gantchart[a].operating_stage].Occupied-1].x_pos=level.vessel[recipe].Position_x;
      			mobility[level.stage[gantchart[a].operating_stage].Occupied-1].y_pos=level.vessel[recipe].Position_y;
      		
      		}
      		count=count+1;

	      }
    		
    		//if we set the vessel to go back when the gannt chart wants it to go to another stage
    		for(var ind=0;ind<Object.keys(mobility).length;ind++){   		
    			if(mobility[ind].enter=="true" && mobility[ind].exit=="true")
    			{
    				mobility[ind].exit="false";    			
    			}
    		}

    		if(time==(gantchart[a].start_point+gantchart[a].processing_time)){   			        		
      		if(time>makespan){    		
      			makespan=time;
      		}
    		}
      
	    }

    	if(count>level.layout.agvNum){
    		alert("Moving vessels cannot be greater than the number of AGV's! Have a look at time= "+time+" seconds");
    		return -1;
    	}
    	time=time+1;
    	if(time==200){			
				escape=true;
				return 0;
			}
	    	
		}
		return mobility;

	}
		
	function findShortestPath(startCoordinates,goal, map, start_vessel,start_agv){
	  var grid=[];
	  //Declaration of grid and forbidden states
	  for (var x = 0; x < level.layout.rowNum; x++) {
      grid[x] = [];
      for (var y = 0; y < level.layout.colNum; y++) {        
        grid[x][y]="Empty";
        //if condition for obstacles
        if(map.gridm[x][y].type=="lava"){       
          grid[x][y]="Obstacle";
        }
      }
	          	     
	  }
	  for(var i=0; i<Object.keys(start_vessel).length;i++){	  
	    x= start_vessel[i].x;
	    y=start_vessel[i].y;
	    grid[x][y]="Obstacle";
	    //The docking point of all vessels is forbidden
	  }
	  for(var i=0; i<Object.keys(start_agv).length;i++){	 
	    x= start_agv[i].x;
	    y=start_agv[i].y;
	    if(level.agv[i].Occupied==0){	    
	      grid[x][y]="Obstacle";
	    }

	  }
	  
	  grid[startCoordinates[0]][startCoordinates[1]]="Start";
	  grid[goal[0]][goal[1]]="Goal";
	  var distanceFromTop = startCoordinates[1];
	  var distanceFromLeft = startCoordinates[0];

	  // Each "location" will store its coordinates
	  // and the shortest path required to arrive there
	  var location = {
	    distanceFromTop: distanceFromTop,
	    distanceFromLeft: distanceFromLeft,
	    path: [],
	    status: 'Start'
	  };

	  // Initialize the queue with the start location already inside
	  var queue = [location];

	  //Loop through the grid searching for the goal
	  //while (queue.length &gt; 0)
	  while (queue.length>0){
	    // Take the first location off the queue
	    var currentLocation = queue.shift();
	    // Explore North
	    var newLocation = exploreInDirection(currentLocation, 'North', grid);
	    if (newLocation.status === 'Goal') {
	      return newLocation.path;
	    } else if (newLocation.status === 'Valid') {
	      queue.push(newLocation);
	    }
	    // Explore East
	    var newLocation = exploreInDirection(currentLocation, 'East', grid);
	    if (newLocation.status === 'Goal') {
	      return newLocation.path;
	    } else if (newLocation.status === 'Valid') {
	      queue.push(newLocation);
	    }

	    // Explore South
	    var newLocation = exploreInDirection(currentLocation, 'South', grid);
	    if (newLocation.status === 'Goal') {
	      return newLocation.path;
	    } else if (newLocation.status === 'Valid') {
	      queue.push(newLocation);
	    }

	    // Explore West
	    var newLocation = exploreInDirection(currentLocation, 'West', grid);
	    if (newLocation.status === 'Goal') {
	      return newLocation.path;
	    } else if (newLocation.status === 'Valid') {
	      queue.push(newLocation);
	    }
	  }

	  //No valid path found
	  return false;

	}

	//This function will check a location's status
	//a location is "valid" if it is on the grid, is not an "obstacle",
	// and has not yet been visited by our algorithm)
	// Returns "Valid", "Invalid", "Blocked", or "Goal"
	function locationStatus(location, grid) {
	  var gridSize = grid.length;
	  var dft = location.distanceFromTop;
	  var dfl = location.distanceFromLeft;

	  if (location.distanceFromLeft <0 || location.distanceFromLeft >=gridSize || location.distanceFromTop < 0 || location.distanceFromTop >= gridSize) {

	    //location is not on the grid--return false
	    return 'Invalid';
	  }else if (grid[dfl][dft] === 'Goal') {
	    return 'Goal';
	  }else if (grid[dfl][dft] !== 'Empty') {
	    // location is either an obstacle or has been visited
	    return 'Blocked';
	  }else{
	    return 'Valid';
	  }
	}

	// Explores the grid from the given location in the given
	// direction
	function exploreInDirection(currentLocation, direction, grid) {
	  var newPath = currentLocation.path.slice();
	  newPath.push(direction);

	  var dft = currentLocation.distanceFromTop;
	  var dfl = currentLocation.distanceFromLeft;

	  if (direction === 'North') {
	    dft -= 1;
	  } else if (direction === 'East') {
	    dfl += 1;
	  } else if (direction === 'South') {
	    dft += 1;
	  } else if (direction === 'West') {
	    dfl -= 1;
	  }

	  var newLocation = {
	    distanceFromTop: dft,
	    distanceFromLeft: dfl,
	    path: newPath,
	    status: 'Unknown'
	  };
	  newLocation.status = locationStatus(newLocation, grid);

	  // If this new location is valid, mark it as 'Visited'
	  if (newLocation.status === 'Valid') {
	    grid[newLocation.distanceFromLeft][newLocation.distanceFromTop] = 'Visited';
	  }

	  return newLocation;
	}

	function loadUI(){
		//level = readLevelFromFile('data.json');
		var gridSize = { x:level.layout.rowNum, y:level.layout.colNum};
		var width=parseInt($("#left").css('width'),10)-10;
		var height=parseInt($("#left").css('height'),10)-10;
		squareWidth = width/gridSize.x;
		squareHeight = height/gridSize.y;
		circleRadius = squareWidth/5;
		agvLength=squareWidth/3;

		var svgSize = getSvgSize(gridSize, squareWidth, squareHeight);
		map = buildMap(gridSize, level);

		svgContainer = d3.select("#left")
		                        .append("svg")
		                        .attr("width", svgSize.width)
		                        .attr("height", svgSize.height)
		                        .attr("class","Frame");
		scales = getScale(gridSize, svgSize);


		drawCells(svgContainer, scales, map.grass, "grass",squareHeight);
		drawCells(svgContainer, scales, map.rock, "rock",squareHeight);
		drawCells(svgContainer, scales, map.lava, "unoccupied",squareHeight);
	 		
		start_vessel={};
		var start_agv={};
		//start points of vessels
		for (var ind = 0; ind < level.layout.vesselNum; ind++) 
	  {
	    start_vessel[ind]= map.gridm[level.vessel[ind].Position_x][level.vessel[ind].Position_y];
	  }
		//start points of AGV's
		for (var ind = 0; ind < level.layout.agvNum; ind++){   
	    start_agv[ind]= map.gridm[level.agv[ind].Position_x][level.agv[ind].Position_y];
	  }

		//making the groups of vessels 
		groups_vessel={};
	  for (var ind = 0; ind < level.layout.vesselNum; ind++){ 	  
	    groups_vessel[ind]= { position:svgContainer.append("g"),	                  id: ind};
	    drawMowerHistory(groups_vessel[ind], scales, [start_vessel[ind]]);
	  }
		//making the groups of AGV's
		groups_agv={};
	  for (var ind = 0; ind < level.layout.agvNum; ind++){ 
	  
	    groups_agv[ind]= {position: svgContainer.append("g"),id: ind} ;                        
	    drawagv(groups_agv[ind], scales, [start_agv[ind]],"position_free");
	  }
	  //parameters for the gridd
	  stage_progress=[];
		stage_height=[];
		for(var i=0;i<level.layout.stageNum;i++){
			stage_height[i]=0;
			stage_progress[i]=0;
		}
		mobility={}; // Main variable for animation
		for(var ind=0;ind<level.layout.vesselNum;ind++){		
		  mobility[ind]={enter:"false", exit:"false"};
		}
		stages=[];
	 	for (var ind = 0; ind < level.layout.stageNum; ind++){ 	  
	    stages[ind]= svgContainer.append("g");
	    //we make svg containers for occupied stages. Now, we can simply remove the elements of the containers when the stages are unoccupied
	  }
	 	  
	}
					
	function Datasource_choose(){
		init();
	}
	
	function load_all(){
		
		gant_chart();
		loadUI();
		add_Markline();
		timeVar_wait=null;
		time=0;
		layout_insert=false;
	}

	function run_all(){		
		haupt_animation();
	}
	
	$(document).ready(function(){
				
		datasource = $(".select_data option:selected").val();		
		datasource_define();

	});
