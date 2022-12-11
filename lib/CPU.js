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
     * Dibuja y conecta las flechas
    */
    drawArrows: function() {
        var drawingComponent = $('#drawing').html("");
        var width = drawingComponent.width();
        var height = drawingComponent.height();
        var paper = Raphael("drawing", width, height);

        function connect(from, to, attributes, label, labelAttributes){
            function getX(element, horizontal) {
				switch(horizontal){
					case 'left':
						return element.position().left;
					case 'right':
						return element.position().left + element.outerWidth(true);
					case 'middle':
						return element.position().left + (element.outerWidth(true) / 2);
					default:
						var percentage = parseInt(horizontal.replace("%", ""));
						return element.position().left + (i.outerWidth(true) * percentage / 100);
				}
			}

            function getY(element, vertical) {
				switch(vertical) {
					case 'top':
						return element.position().top;
					case 'bottom':
						return element.position().top + element.outerHeight(true);
					case 'middle':
						return element.position().top + (element.outerHeight(true) / 2);
					default:
						var percentage = parseInt(vertical.replace("%", ""));
						return element.position().top + (element.outerHeight(true) * percentage / 100);
				}
			}

            var x1 = getX(from.element, from.horizonte);
			var x2 = x1;
			if(to.horizonte) {
				x2 = getX(to.element, to.horizonte);
			}
			
			var y1 = getY(from.element, from.vertical);
			var y2 = y1;
			if(to.vertical) {
				y2 = getY(to.element, to.vertical);
			}

            var elem = paper.path("M" + Math.floor(x1) + " " + Math.floor(y1) + "L" +  Math.floor(x2) + " " + Math.floor(y2));
			if(attributes === undefined) {
				attributes = {"stroke-width": 10, "arrow-end":"block-narrow-short"};
			}
			elem.attr(attributes);
            			
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
		var MBR = $('#reg_mdr');
		var IR = $('#reg_cir');
		var ALU = $('#alu');
		var EAX = $('#reg_eax');
		var CPU = $('.cpu');
		var RAM = $('.ram');
        var CONTROL_BUS = $('');
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
     * Crea la vista de toda la CPU
    */
    init: function(DOM_CPU){
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
                return '<div class="register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value_address value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
            }
			return '<div class="register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
		}

        html += getRegisterHtml('PC', 0, "Contador del programa");
		html += getRegisterHtml('MAR', 0, "Registro de dirección de memoria");
		html += getRegisterHtml('MBR', 0, "Registro intermedio de memoria");
		html += getRegisterHtml('EAX', 0, "Acumulador");
		html += getRegisterHtml('IR', 0, "Registro de instrucción");

        html += '<div id="alu">ALU</div>';
		html += '<div id="cu">Unidad de Control</div>';

        html = CPU.drawDecoder(html)
        html += '</div>';

        html = CPU.drawBus(html)




        $(DOM_CPU).html(html);



        /**
         * Permite cambiar la forma en la que se visualizan los 
         * valores de los registros entre binario, decimal y hexadecimal
         */
        $('.btn_values').click(function(e) {
			var mode = e.currentTarget.id.split("_")[2];

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
						jq.text(CPU.dec2bin(val, 8));
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
		});
		
		$('#btn_values_binary').trigger("click");
    }
}
$(function() {
	CPU.init("#cpu")
});
