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
        CF: 0,
        ZF: 0
    },
	STATE: 0,
	RUNNING: false,
	NEXT_TIMEOUT: 0,
	RUN_DELAY: 1000,


	/**
	 * Funcionalidad
	 * 
	 */
	step: function(){
		function setState(nextState, stageName, description) {
				
			description = description.replace(/\*(.*?)\*/g, function(match, contents) {
				return '<span class="hint_name">' + contents + '</span>';
			});
			CPU.showHint('<span class="fetch_decode_execute ' + stageName.toLowerCase() + '">' + stageName + '</span>' + description);
			CPU.STATE = nextState;
		}
		switch(CPU.STATE){
			case 0: 
				setState(1, "Ciclo de captación:", " La *Unidad de Control* copia el valor del *Contador de programa* en el *registro de direccion de memoria* y luego este se coloca en el *bus de direcciones*");
				CPU.REGISTERS.MAR = CPU.REGISTERS.PC;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_pc,#reg_mar').addClass('active');
				$('.current_instruction').removeClass('current_instruction');
				$('#ram_address_' + CPU.REGISTERS.PC).addClass('current_instruction');
				break;
			case 1:
				setState(2, "Ciclo de captación:", "La *Unidad de Control* coloca la dirección del MAR en el *Bus de Direcciones* y luego carga el valor almacenado en el *Bus de Datos*.");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 2:
				setState(3, "Ciclo de captación:", "La *Unidad de Control* almacena el valor del *Bus de Datos* en el *MBR*.");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;	
			case 3:
				setState(4,"Ciclo de captación:", "La *Unidad de Control* incrementa el *PC* en 1");
				CPU.REGISTERS.PC++;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_pc').addClass('active');
				break;
			case 4: //tercer paso del ciclo de captación
				setState(5, "Ciclo de captación:", "La *Unidad de Control* copia el valor del *MBR* en el *IR*.");
				CPU.REGISTERS.IR = CPU.REGISTERS.MBR;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_ir').addClass('active');
				break;		
			case 5:
				setState(6, "Decodificación de instrucción", "El *decodificador* obtiene el *codop* y el *operando* del *IR*"); 
				$('.active').removeClass('active');
				$('#reg_ir,.decode_unit table').addClass('active');
				break;				
			case 6:
				var codop = ((CPU.REGISTERS.IR & 0xff) >> 4);
				console.log(CPU.REGISTERS.IR & 0xff)
				console.log(codop);
				$('.active').removeClass('active');
				$('.decode_row_' + codop).addClass('active');
				switch(codop) {
					case 0:
						setState(7, "Decodificación de instrucción", "*codop 0000* ->  HALT");
						break;
						
					case 1:
						setState(8, "Decodificación de instrucción", "*codop 0001* ->  LOAD");
						break;
						
					case 2:
						setState(9, "Decodificación de instrucción", "*codop 0010* ->  STORE");
						break;
						
					case 3:
						setState(10, "Decodificación de instrucción", "*codop 0011* ->  ADD");
						break;
						
					case 4:
						setState(11, "Decodificación de instrucción", "*codop 0100* ->  SUB");
						break;
						
					case 5:
						setState(12, "Decodificación de instrucción", "*codop 0101* ->  MPY");
						break;
						
					case 6:
						setState(13, "Decodificación de instrucción", "*codop 0110* ->  DIV");
						break;
						
					case 7:
						setState(14, "Decodificación de instrucción", "*codop 0111* ->  AND");
						break;
						
					case 8:
						setState(15, "Decodificación de instrucción", "*codop 1000* ->  OR");
						break;

					case 9:
						setState(16, "Decodificación de instrucción", "*codop 1001* ->  NOT");
						break;
						
					case 10:
						setState(17, "Decodificación de instrucción", "*codop 1010* ->  CMP");
						break;
						
					case 11:
						setState(18, "Decodificación de instrucción", "*codop 1011* ->  JMP");
						break;

					case 12:
						setState(19, "Decodificación de instrucción", "*codop 1100* ->  JG");
						break;

					case 13:
						setState(20, "Decodificación de instrucción", "*codop 1101* ->  INPUT");
						break;
						
					case 14:
						setState(21, "Decodificación de instrucción", "*codop 1110* ->  OUTPU");
						break;
						
					case 15:
						setState(22, "Decodificación de instrucción", "*codop 1111* ->  CLEAR");
						break;			
				}
				break;

			//HALT
			case 7: 
				setState(7, "Ciclo de ejecución", "Se ha *detenido* la ejecución del programa");
				$('.active').removeClass('active');
				CPU.RUNNING = false;
				break;
			
			//LOAD
			case 8: 
				setState(81, "Decodificación de instrucción", "El *decodificador* envia el operando al *MBR* y este a su vez lo envia al *bus de direcciones*");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
			break;
			
			case 81: 
				setState(82, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección en el *bus de direcciones* y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 82:
				setState(83, "Ciclo de ejecución", "La *Unidad de Control* copia el valor del *Bus de Datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 83:
				setState(23, "Ciclo de ejecución", "La *unidad de control* envia el valor del *MBR* al acumulador");
				CPU.REGISTERS.EAX = CPU.REGISTERS.MBR;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_eax').addClass('active');
			break;

			//STORE	
			case 9:
				setState(91, "Decodificación de instrucción", "La *unidad de control* envia el valor del *acumulador* al *MBR*");
				CPU.REGISTERS.MBR = CPU.REGISTERS.EAX;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_eax,#reg_mbr').addClass('active');
				break;
			case 91:
				setState(92, "Decodificación de instrucción", "El *decodificador* envia el *operando* al *MAR* y este lo envia al *Bus de direcciones*");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;
			case 92: 
				setState(0, "Ciclo de ejecución", "La *unidad de control* le dice a la memoria que guarde el valor que se encuentra en el *bus de datos* en la dirección que se encuentra en el *bus de direcciones*");
				CPU.RAM[CPU.REGISTERS.MAR] = CPU.REGISTERS.MBR;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;

			//ADD
			case 10:
				setState(101, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 101: 
				setState(102, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 102:
				setState(103, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 103:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que sume el valor del *acumulador* y el *MBR*. El resultado lo coloca de nuevo en el *acumulador");
				CPU.REGISTERS.EAX += CPU.REGISTERS.MBR;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#alu,#acc').addClass('active');
				break;

			//SUB
			case 11:
				setState(111, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 111: 
				setState(112, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 112:
				setState(113, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 113:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que sume el valor del *acumulador* y el *MBR*. El resultado lo coloca de nuevo en el *acumulador");
				CPU.REGISTERS.EAX = CPU.REGISTERS.MBR - CPU.REGISTERS.EAX;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#alu,#acc').addClass('active');
				break;
			
			//MPY
			case 12:
				setState(121, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 121: 
				setState(122, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 122:
				setState(123, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 123:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que sume el valor del *acumulador* y el *MBR*. El resultado lo coloca de nuevo en el *acumulador");
				CPU.REGISTERS.EAX *= CPU.REGISTERS.MBR;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#alu,#acc').addClass('active');
				break;

			//DIV
			case 13:
				setState(131, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 131: 
				setState(132, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 132:
				setState(133, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 133:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que sume el valor del *acumulador* y el *MBR*. El resultado lo coloca de nuevo en el *acumulador");
				CPU.REGISTERS.EAX = Math.floor(CPU.REGISTERS.MBR / CPU.REGISTERS.EAX);
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#alu,#acc').addClass('active');
				break;

			// AND bit a bit
			case 14:
				setState(141, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 141: 
				setState(142, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 142:
				setState(143, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 143:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que haga el AND bit a bit y luego pone el resultado en el *acumulador*");
				console.log("eax-before",CPU.REGISTERS.EAX)
				CPU.REGISTERS.EAX = CPU.REGISTERS.MBR & CPU.REGISTERS.EAX
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_eax,#alu,#acc').addClass('active');
				break;

			// OR bit a bit
			case 15:
				setState(151, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 151: 
				setState(152, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 152:
				setState(153, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 153:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que haga el OR bit a bit y luego pone el resultado en el *acumulador*");
				console.log("eax-before",CPU.REGISTERS.EAX)
				CPU.REGISTERS.EAX = CPU.REGISTERS.MBR | CPU.REGISTERS.EAX
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_eax,#alu,#acc').addClass('active');
				break;

			// NOT bit a bit
			case 16:
				setState(161, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 161: 
				setState(162, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 162:
				setState(163, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 163:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que haga el NOT bit a bit y luego pone el resultado en el *acumulador*");
				console.log("eax-before",CPU.REGISTERS.EAX)
				CPU.REGISTERS.EAX = ~CPU.REGISTERS.MBR
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_eax,#alu,#acc').addClass('active');
				break;

			// CMP
			case 17:
				setState(171, "Decodificación de instrucción", "El *decodificador* envía el *codop* al *MAR* y a su vez este lo envia al *Bus de Direcciones*.");
				CPU.REGISTERS.MAR = CPU.REGISTERS.IR & 0x0F;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;
			case 171: 
				setState(172, "Ciclo de ejecución", "La *unidad de control* le indica a la *memoria* que busque la dirección y coloque el valor en el *bus de datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + CPU.REGISTERS.MAR).addClass('active');
				break;
			case 172:
				setState(173, "Ciclo de ejecución", "La *unidad de control* coloca el valor del *bus de datos* en el *MBR*");
				CPU.REGISTERS.MBR = CPU.RAM[CPU.REGISTERS.MAR];
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr').addClass('active');
				break;
			case 173:
				setState(0, "Ciclo de ejecución", "La *unidad de control* le indica a la *ALU* que haga la comparación y dependiendo del resultado se establecen los registros de banderas CFy ZF en 0 o 1");
				if(CPU.REGISTERS.MBR == CPU.REGISTERS.EAX){
					CPU.REGISTERS.ZF = 1
				} 
				else if(CPU.REGISTERS.MBR > CPU.REGISTERS.EAX){
					CPU.REGISTERS.CF = 1
				}
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mbr,#reg_eax,#reg_cf,#reg_zf,#alu,#acc').addClass('active');
				break;
			
			// JMP - JUMP condicional
			case 18:
				setState(0, "Ciclo de ejecución", "La *unidad de control* verifica que el registro *ZF* este en 1 (si está en 0 se realiza un salto)");
				if(CPU.REGISTERS.ZF == 0){
					CPU.REGISTERS.PC = CPU.REGISTERS.IR & 0x0F
				} 
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_mar,#reg_pc,#reg_zf,#alu,#acc').addClass('active');
				break;


			// INPUT / OUTPUT
			case 20:
				setState(23, "Ciclo de ejecución", "El *bus de control* lee el *dispositivos de entrada* y coloca el dato en el *acumulador*");
				CPU.REGISTERS.EAX = parseInt(prompt("Ingresar valor decimal:")) & 0xFF;
				CPU.updateRegisters();
				$('.active').removeClass('active');
				$('#reg_eax').addClass('active');
				break;
			case 21:
				setState(23, "Ciclo de ejecución", "El *bus de control* envia el valor del *acumulador* al *dispositivo de salida*");
				alert("Resultado: " + CPU.REGISTERS.EAX);
				$('.active').removeClass('active');
				$('#reg_eax').addClass('active');
				break;




			case 23:
				setState(0, "Ciclo de ejecución", "La *unidad de control* comprueba si hay *interrupciones* o si puede volver a iniciar el ciclo");
				break;
		}

		if(CPU.RUNNING) {
			CPU.NEXT_TIMEOUT = setTimeout(CPU.step, CPU.RUN_DELAY);
		}
	},

	//mensaje abajo de la pantalla
	showHint: function(html) {
		$('#hint_text').html(html);
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
     * @returns 
     */
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
	
    /**
     * 
     * @param dec Número en formato decimal
     * @returns 
     */
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
	

    /**
     * Actualiza el valor de los registros
     */
    updateRegisters: function() {
        var regs = Object.keys(CPU.REGISTERS);
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
			var jqDest = $('#reg_' + regs[i].toLowerCase() + "_val");
			writeValue(val, jqDest);
		}

        for(var i = 0; i < CPU.RAM.length; i++) {
			writeValue(CPU.RAM[i], $('#ram_value_' + i));
		}
    },

    

    /**
     * Dibuja los botones para visualziar los registros
     */
    drawRamButtons: function(html) {
        html += '<div class="btn-group" role="group" aria-label="Number base">'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_binary"> Binario</button>'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_denary">  Decimal </button>'
        html += '<button type="button" class="btn btn_values btn-secondary" id="btn_values_hex"> Hex </button></div>'
        return html
    },

    /**
     * Dibuja el decodificador con todos los CODOP
     */
    drawDecoder: function (html){
        html += '<div class="decode_unit"><h4> Decodificador </h2>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Codop</th><th>Operando</th><th>Instrucción</th></tr></thead>';
		html += '<tr class="decode_row_0"><td>0000</td><td>0000</td><td>HALT</td></tr>';
		html += '<tr class="decode_row_1"><td>0001</td><td>dirección</td><td>LOAD</td></tr>';
		html += '<tr class="decode_row_2"><td>0010</td><td>dirección</td><td>STORE</td></tr>';
		html += '<tr class="decode_row_3"><td>0011</td><td>dirección</td><td>ADD</td></tr>';
		html += '<tr class="decode_row_4"><td>0100</td><td>dirección</td><td>SUB</td></tr>';
		html += '<tr class="decode_row_5"><td>0101</td><td>dirección</td><td>MPY</td></tr>';
		html += '<tr class="decode_row_6"><td>0110</td><td>dirección</td><td>DIV</td></tr>';
		html += '<tr class="decode_row_7"><td>0111</td><td>dirección</td><td>AND</td></tr>';
		html += '<tr class="decode_row_8"><td>1000</td><td>dirección</td><td>OR</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>dirección</td><td>NOT</td></tr>';
		html += '<tr class="decode_row_10"><td>1010</td><td>dirección</td><td>CMP</td></tr>';
		html += '<tr class="decode_row_11"><td>1011</td><td>dirección</td><td>JMP</td></tr>';
		html += '<tr class="decode_row_12"><td>1100</td><td>dirección</td><td>JG</td></tr>';
		html += '<tr class="decode_row_13"><td>1101</td><td>0001</td><td>INPUT</td></tr>';
		html += '<tr class="decode_row_14"><td>1110</td><td>0010</td><td>OUTPUT</td></tr>';
		html += '<tr class="decode_row_15"><td>1111</td><td>1111</td><td>CLEAR</td></tr>';
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
		
		/**
		 * Conecta las flechas
		 */
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
        html = CPU.drawRamButtons(html)
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
        for(var address = 0; address < 16; address++) {
			CPU.RAM[address] = initZeros? 0 : CPU.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value_address value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Dirección de memoria ' + address + '">' + CPU.RAM[address] + '</td></tr>';
		}
        html += '</table>';
		html += '</div>';

        /**
         * Dibuja la CPU
         */
        html += '<div class="cpu"><h3> CPU</h3>';
        function getRegisterHtml(name, value, desc) {
            if(name.toLowerCase() == "pc" || name.toLowerCase() == "mar"){
                return '<div class="register_address" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_address value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
            }
			if(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].includes(name.toLowerCase())){
				return '<div class="general_register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
			}
			if(['of', 'cf', 'zf'].includes(name.toLowerCase())){
				return '<div class="flag_register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_flag value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
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
		html += getRegisterHtml('OF', 0, "Desbordamiento Over Flow Flag");
		html += getRegisterHtml('CF', 0, "Acarreo Carry Flag");
		html += getRegisterHtml('ZF', 0, "Zero Flag");

        html += '<div id="alu">ALU</div>';
		html += '<div id="cu">Unidad de Control</div>';

        html = CPU.drawDecoder(html)
        html += '</div>';

        html = CPU.drawBus(html)



		
        $(DOM_CPU).html(html);
		CPU.drawArrows();

		

		$('#modal_change_value').modal({ show: false})
		
		/**
		 * Hace un reset a la cpu
		 * pone los valores en 0
		 */
		$('#btn_reset_cpu').click(function() {
			CPU.STATE = 0;
			for(const reg in CPU.REGISTERS){
				CPU.REGISTERS[reg] = 0
			}
			CPU.showHint("Registros de la CPU reiniciados")
			$('.current_instruction').removeClass('current_instruction');	
			CPU.updateRegisters();
		});		

		setTimeout(function() {
			$('#st-2').addClass('st-hidden');
		}, 5000);

		/**
		 * Hace un reset a la memoria
		 * pone los valores en 0
		 */
		$('#btn_reset_ram').click(function() {
			CPU.showHint("Registros de memoria reiniciados");
			for(var address = 0; address < 16; address++) {
				CPU.RAM[address] = 0;
				var jq = $('#ram_value_' + address);
				if(jq.hasClass('value_denary')) {
					jq.text(0);
				}
				if(jq.hasClass('value_binary')) {
					jq.text("00000000");
				}
				if(jq.hasClass('value_hex')) {
					jq.text("00");
				}
			}
		});


		$('.value.editable, .value_address.editable, .value_flag.editable').click(function(e) {
			var id = e.currentTarget.id;
			
			var jq = $('#' + id);
			$('#modal_change_value_title').text(jq.data("description"));
			$('#change_value_from').text(jq.text());
			$('#change_value_to').val(jq.text());
			CPU.lastChangedValue = id;
			$('#modal_change_value').modal('show')
		});

		/**
		 * Acepta los cambios
		 */
		$('#btn_change_value_ok').click(function() {
			function getInt(jq, val) {
				if(jq.hasClass('value_hex')) {
					return CPU.hex2dec(val);
				}
				if(jq.hasClass('value_binary')) {
					return CPU.bin2dec(val);
				}
				val = parseInt(val, 10) & 0xFF;
				return val >= 128? val - 256: val;
			}
			
			var jq = $('#' + CPU.lastChangedValue);
			var value = $('#change_value_to').val();
			var parts = CPU.lastChangedValue.split("_");
			switch(parts[0]) {
				case 'ram':
					var address = parseInt(parts[2]);
					CPU.RAM[address] = getInt(jq, value);
				break;
				case 'reg':
					var reg = parts[1];
					CPU.REGISTERS[reg] = getInt(jq, value);
				break;
				
			}

			CPU.updateRegisters();
		});

		/**
		 * Ejecutae el programa paso a paso
		 */
		$('#btn_step').click(CPU.step);

		/**
		 * Ejecutae el programa de manera continua
		*/
		$('#btn_run').click(function() {
			if(CPU.RUNNING && CPU.NEXT_TIMEOUT) {
				clearTimeout(CPU.NEXT_TIMEOUT);
			} else {
				CPU.RUNNING = true;
				CPU.step();
			}
		});

		$('#modal_change_value').on('shown.bs.modal', function() {
			$('#change_value_to').focus().select();
		});


        /**
         * Permite cambiar la forma en la que se visualizan los 
         * valores de los registros entre binario, decimal y hexadecimal
         */
		$('.btn_values').click(function(e) {
			var mode = e.currentTarget.id.split("_")[2];
			$('.value, .value_address, .value_flag').each(function(index, element) {
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
						jq.text(CPU.dec2bin(val));
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
