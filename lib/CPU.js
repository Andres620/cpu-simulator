var CPU = {
    DOOM_CPU: null,
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

    hex2bin: function(hex) {
		var v = parseInt(hex, 16) & 0xFF;
		return CPU.padNumber(v.toString(2), 8);
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
	
	dec2bin: function(dec) {
		return CPU.padNumber((dec & 0xFF).toString(2), 8);
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
     * Crea la vista de toda la CPU
    */
    init: function(DOOM_CPU){
        CPU.DOOM_CPU = DOOM_CPU
        var html ='<div id="drawing"></div>'
        html += '<div class="ram"><h3> MEMORIA </h3>';
        html += '<div class="btn-group" role="group" aria-label="Number base">'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_binary"> <i class="fa fa-barcode"></i> Binario</button>'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_denary"> <i class="fa fa-calculator"></i> Decimal </button>'
        html +='</div>'
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
        for(var address = 0; address < 128; address++) {
			CPU.RAM[address] = initZeros? 0 : CPU.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Memory address ' + address + '">' + CPU.RAM[address] + '</td></tr>';
		}
        html += '</table>';
		html += '</div>';

        $(DOOM_CPU).html(html);
       
    }
}
$(function() {
	CPU.init("#cpu")
});
