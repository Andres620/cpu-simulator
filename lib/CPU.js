var CPU = {
    DOM_CPU: null,
    RAM : [],
    REGISTERS: {
        EAX: 0,
        PC: 0,
        MAR: 0,
        MBR: 0,
        IR: 0,
        R1: 0,
        R2: 0,
        R3: 0,
        R4: 0,
        R5: 0,
        R6: 0,
        OF: 0,
        CG: 0,
        ZF: 0
    },

    /**
     * rellena un numero con 0
     * EJ. si se necesita un numero de 8 bits y recibimos uno de 4
     * num = 1011
     * 00001011
     */
    padNumber: function(val, length) {
		while(val.length < length) {
			val = "0" + val;
		}
		return val;
	},

    /**
     * 
     * @param dec Número en formato hexadecimal
     * @param bits Cantidad de bis a convertir 
     * @returns 
     */
    hex2bin: function(hex, bits) {
		var v = parseInt(hex, 16) & 0xFF;
		return CPU.padNumber(v.toString(2), bits);
	},
	
	bin2hex: function(bin) {
		var v = parseInt(bin, 2) & 0xFF;
		return CPU.padNumber(v.toString(16), 2);
	},
	
	bin2dec: function(bin) {
		var v = parseInt(bin, 2) & 0xFF;
		if(v >= 128)
			v -= 256;
		return v;
	},
	
    /**
     * 
     * @param dec Número en formato decimal
     * @param bits Cantidad de bis a convertir 
     * @returns 
     */
	dec2bin: function(dec, bits) {
		return CPU.padNumber((dec & 0xFF).toString(2), bits);
	},
	
	hex2dec: function(hex) {
		var v = parseInt(hex, 16) & 0xFF;
		if(v >= 128)
			v -= 256;
		return v;
	},
	
	dec2hex: function(dec) {
		return CPU.padNumber((dec & 0xFF).toString(16), 2);
	},
	

    /**
     * Actualiza el valor de los registros
     */
    updateRegisters: function() {
        var regs = Object.keys(this.REGISTERS);

        function writeValue(val, jqDest) {
			if(jqDest.hasClass("value_binary")) {
				val = CPU.dec2bin(val);
			}
			if(jqDest.hasClass("value_hex")) {
				val = CPU.dec2hex(val);
			}
			jqDest.text(val);
		}

        for(var i = 0; i < regs.length; i++) {
			var val = CPU.REGISTERS[regs[i]];
			var jqDest = $('#reg_' + regs[i] + "_val");
			writeValue(val, jqDest);
		}

        for(var i = 0; i < CPU.RAM.length; i++) {
			writeValue(CPU.RAM[i], $('#ram_value_' + i));
		}
    },

    

    /**
     * Dibuja los botones para visualziar los registros
     */
    drawButtons: function(html) {
        html += '<div class="btn-group" role="group" aria-label="Number base">'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_binary"> <i class="fa fa-barcode"></i> Binario</button>'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_denary"> <i class="fa fa-calculator"></i> Decimal </button>'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_hex"> <i class="fa fa-hashtag"></i> Hex </button></div>'
        return html
    },

    /**
     * Dibuja el decodificador con todos los CODOP
     */
    drawDecoder: function (html){
        html += '<div class="decode_unit"><h4> Decodificador </h2>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Codop</th><th>Instrucción</th></tr></thead>';
		html += '<tr class="decode_row_0"><td>0000</td><td>MOVE</td></tr>';
		html += '<tr class="decode_row_1"><td>0001</td><td>ADD</td></tr>';
		html += '<tr class="decode_row_2"><td>0010</td><td>SUB</td></tr>';
		html += '<tr class="decode_row_3"><td>0011</td><td>MPY</td></tr>';
		html += '<tr class="decode_row_5"><td>0100</td><td>DIV</td></tr>';
		html += '<tr class="decode_row_6"><td>0101</td><td>AND</td></tr>';
		html += '<tr class="decode_row_7"><td>0110</td><td>OR</td></tr>';
		html += '<tr class="decode_row_8"><td>0111</td><td>NOT</td></tr>';
		html += '<tr class="decode_row_9"><td>1000</td><td>HALT</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>CMP</td></tr>';
		html += '<tr class="decode_row_9"><td>1010</td><td>JMP</td></tr>';
		html += '<tr class="decode_row_9"><td>1011</td><td>JG (if EAX > Registro)</td></tr>';
		html += '<tr class="decode_row_9"><td>1100</td><td>CONVERT</td></tr>';
		html += '<tr class="decode_row_9"><td>1101</td><td>INPUT</td></tr>';
		html += '<tr class="decode_row_9"><td>1110</td><td>OUTPUT</td></tr>';
		html += '<tr class="decode_row_9"><td>1111</td><td>CLEAR</td></tr>';
		html += '</table></div>';
        return html
    },

    /**
     * Dibuja los buses de datos
     */    
    drawBus: function (html){
        html += '<div class="bus_control" id="control_bus"><h4>Bus <br/><br/> de <br/><br/> control</h4></div>';
        html += '<div class="bus_data" id="data_bus"><h4>Bus <br/><br/> de <br/><br/> datos</h4> </div>';
        html += '<div class="bus_address" id="address_bus"><h4>Bus <br/><br/> de <br/><br/> direcciones</h4> </div>';
        return html
    },


	
	/**
     * Dibuja y conecta las flechas
    */
	drawArrows: function() {
		var d = $('#drawing').html("");
		var w = d.width();
		var h = d.height();
		var paper = Raphael("drawing", w, h);
		paper.clear();

		function connect(from, to, attributes, label, labelAttributes) {

			function getX(i, a) {
				switch(a){
					case 'left':
						return i.position().left;
					case 'right':
						return i.position().left + i.outerWidth(true);
					case 'middle':
						return i.position().left + (i.outerWidth(true) / 2);
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().left + (i.outerWidth(true) * percentage / 100);
				}
			}
			
			function getY(i, a) {
				switch(a) {
					case 'top':
						return i.position().top;
					case 'bottom':
						return i.position().top + i.outerHeight(true);
					case 'middle':
						return i.position().top + (i.outerHeight(true) / 2);
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().top + (i.outerHeight(true) * percentage / 100);
				}
			}
			var x1 = getX(from.e, from.h);
			var x2 = x1;
			if(to.h) {
				x2 = getX(to.e, to.h);
			}
			
			var y1 = getY(from.e, from.v);
			var y2 = y1;
			if(to.v) {
				y2 = getY(to.e, to.v);
			}
			
			var e = paper.path("M" + Math.floor(x1) + " " + Math.floor(y1) + "L" +  Math.floor(x2) + " " + Math.floor(y2));
			if(attributes === undefined) {
				attributes = {"stroke-width": 10, "arrow-end":"block-narrow-short"};
			}
			e.attr(attributes);
			
			if(label) {
				var x = Math.floor((x1 + x2) / 2);
				var y = Math.floor((y1 + y2) / 2);
				var text = paper.text(x, y, label);
				if(labelAttributes) {
					text.attr(labelAttributes);
				}
			}
		}
		
		var PC = $('#reg_pc');
		var MAR = $('#reg_mar');
		var DECODE_UNIT = $('.decode_unit');
		var MBR = $('#reg_mbr');
		var IR = $('#reg_ir');
		var GENERAL_REGISTERS = $('#reg_r6');
		var ALU = $('#alu');
		var EAX = $('#reg_eax');
		var FLAGS = $('#reg_cf');
		var RAM = $('.ram');
		var CONTROL_UNIT = $('#cu');
		var CONTROL_BUS = $('#control_bus');
    	var DATA_BUS = $('#data_bus');
    	var ADDRESS_BUS = $('#address_bus');
		
		connect({e:ALU, h:"left", v:"middle"}, {e:DECODE_UNIT, h:"right"}, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:ALU, h:"20%", v:"top"}, {e:GENERAL_REGISTERS, v:"bottom"});
		
		connect({e:ALU, h:"right", v:"bottom"}, {e:MBR, h:"20%"}, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:MBR, h:"20%", v:"top"}, {e:ALU, v:"87%"}, {"stroke-width": 10});
		
		connect({e:ALU, h:"right", v:"middle"}, {e:FLAGS,h:"left", v:"middle"});
		connect({e:PC, h:"right", v:"middle"}, {e:MAR, h:"left", v:"middle"});
		connect({e:DECODE_UNIT, h:"60%", v:"top"}, {e:PC, v:"bottom"});
		connect({e:DECODE_UNIT, h:"80%", v:"top"}, {e:MAR, h:"left", v:"bottom"});
		connect({e:MBR, h:"middle", v:"bottom"}, {e:IR, h:"middle", v:"top"});
		connect({e:IR, h:"left", v:"middle"}, {e:DECODE_UNIT, h:"right"});

		connect({e:EAX, h:"20%", v:"top"}, {e:ALU, v:"bottom"}, {"stroke-width": 10, "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"});
		connect({e:MBR, h:"4%", v:"top"}, {e:EAX, h:"90%", v:"bottom"}, {"stroke-width": 10, "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"});
		connect({e:CONTROL_BUS, h:"left", v:"91%"}, {e:CONTROL_UNIT, h:"right" , v:"middle"}, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:ADDRESS_BUS, h:"left", v:"5%"}, {e:MAR, h:"right" }, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:CONTROL_BUS, h:"middle", v:"5%"}, {e:RAM, h:"left"});
		connect({e:RAM, h:"left", v:"12%"}, {e:DATA_BUS, h:"middle"});
		connect({e:ADDRESS_BUS, h:"middle", v:"20%"}, {e:RAM, h:"left"});
		connect({e:DATA_BUS, h:"left", v:"66%"}, {e:MBR, h:"right"});
		connect({e:CONTROL_UNIT, h:"-97%", v:"middle"}, {e:ALU, h:"5%" ,v:"bottom"}, {"stroke-width": 10,  "arrow-end":"block-narrow-short"});
		connect({e:CONTROL_UNIT, h:"left", v:"middle"}, {e:ALU, h:"2%"}, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:DECODE_UNIT, h:"right", v:"98%"}, {e:CONTROL_UNIT, h:"left", v:"bottom"});
	},


    /**
     * Crea la vista de toda la CPU
    */
    init: function(DOM_CPU){
		$(window).resize(CPU.drawArrows);
        CPU.DOM_CPU = DOM_CPU

        /**
         * Dibuja la RAM
         */
        var html ='<div id="drawing"></div>'
        html += '<div class="ram"><h3> MEMORIA </h3>';
        html = CPU.drawButtons(html)
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Dirección</th><th>Valor</th></tr></thead>';
        var params = window.location.search
        var ram = []
        var initZeros = true
        /**
         * Si hay un programa cargado en la RAM no ponerla en ceros
         */
        if(ram = params.replace("ram=", "")) {
			if(ram = ram.match(/([0-9a-fA-F]{2})/g)) {
				initZeros = false;
			}
		}

        /**
         * Agrega valores a la ram
         */
        for(var address = 0; address < 128; address++) {
			CPU.RAM[address] = initZeros? 0 : CPU.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value_address value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Memory address ' + address + '">' + CPU.RAM[address] + '</td></tr>';
		}
        html += '</table>';
		html += '</div>';

        /**
         * Dibuja la CPU
         */
        html += '<div class="cpu"><h3><i class="fa fa-microchip"></i> CPU</h3>';
        function getRegisterHtml(name, value, desc) {
            if(name.toLowerCase() == "pc" || name.toLowerCase() == "mar"){
                return '<div class="register_address" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value_address value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
            }
			if(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].includes(name.toLowerCase())){
				return '<div class="general_register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
			}
			if(['of', 'cf', 'zf'].includes(name.toLowerCase())){
				return '<div class="flag_register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value_one_bit value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
			}
			return '<div class="register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
		}

        html += getRegisterHtml('PC', 0, "Contador del programa");
		html += getRegisterHtml('MAR', 0, "Registro de dirección de memoria");
		html += getRegisterHtml('MBR', 0, "Registro intermedio de memoria");
		html += getRegisterHtml('EAX', 0, "Acumulador");
		html += getRegisterHtml('IR', 0, "Registro de instrucción");
		html += getRegisterHtml('R1', 0, "Registro general 1");
		html += getRegisterHtml('R2', 0, "Registro general 2");
		html += getRegisterHtml('R3', 0, "Registro general 3");
		html += getRegisterHtml('R4', 0, "Registro general 4");
		html += getRegisterHtml('R5', 0, "Registro general 5");
		html += getRegisterHtml('R6', 0, "Registro general 6");
		html += getRegisterHtml('OF', 0, "Desvordamiento Over Flow Flag");
		html += getRegisterHtml('CF', 0, "Acarreo Carry Flag");
		html += getRegisterHtml('ZF', 0, "Zero Flag");

        html += '<div id="alu">ALU</div>';
		html += '<div id="cu">Unidad de Control</div>';

        html = CPU.drawDecoder(html)
        html += '</div>';

        html = CPU.drawBus(html)




        $(DOM_CPU).html(html);
		CPU.drawArrows();


        /**
         * Permite cambiar la forma en la que se visualizan los 
         * valores de los registros entre binario, decimal y hexadecimal
         */
        $('.btn_values').click(function(element) {
			var mode = element.currentTarget.id.split("_")[2];

            //cambia la visualizacion de los VALORES de los registros
			$('.value').each(function(index, element) {
				var jq = $(this);
				var val = jq.text();
				if(jq.hasClass("value_binary")) {
					val = parseInt(val, 2);
				}
				if(jq.hasClass("value_denary")) {
					val = parseInt(val, 10);
				}
				if(jq.hasClass("value_hex")) {
					val = parseInt(val, 16);
				}
				switch(mode) {
					case 'binary':
						jq.text(CPU.dec2bin(val, 32));
						break
					case 'hex':
						jq.text(CPU.dec2hex(val));
						break;
					case 'denary':
						jq.text(val);
				}
			}).removeClass("value_binary value_denary value_hex").addClass("value_" + mode);

            // cambia la visualizacion de las DIRECCIONES de los registros
            $('.value_address').each(function(index, element) {
				var jq = $(this);
				var val = jq.text();
				if(jq.hasClass("value_binary")) {
					val = parseInt(val, 2);
				}
				if(jq.hasClass("value_denary")) {
					val = parseInt(val, 10);
				}
				if(jq.hasClass("value_hex")) {
					val = parseInt(val, 16);
				}
				switch(mode) {
					case 'binary':
						jq.text(CPU.dec2bin(val, 4));
						break
					case 'hex':
						jq.text(CPU.dec2hex(val));
						break;
					case 'denary':
						jq.text(val);
				}
			}).removeClass("value_binary value_denary value_hex").addClass("value_" + mode);    
			
			// cambia la visualizacion de las registros de bandera
            $('.value_one_bit').each(function(index, element) {
				var jq = $(this);
				var val = jq.text();
				if(jq.hasClass("value_binary")) {
					val = parseInt(val, 2);
				}
				if(jq.hasClass("value_denary")) {
					val = parseInt(val, 10);
				}
				if(jq.hasClass("value_hex")) {
					val = parseInt(val, 16);
				}
				switch(mode) {
					case 'binary':
						jq.text(CPU.dec2bin(val, 1));
						break
					case 'hex':
						jq.text(CPU.dec2hex(val));
						break;
					case 'denary':
						jq.text(val);
				}
			}).removeClass("value_binary value_denary value_hex").addClass("value_" + mode);  
		});
		
		$('#btn_values_binary').trigger("click");
    }
}
$(function() {
	CPU.init("#cpu")
});
