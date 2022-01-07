/**
* Makecode YFROBOT LED Dot Matrix 5x7 Module (TM1637) Package.
*/
/** 
 * @file YFMATRIX57
 * @brief YFROBOT's LED Dot Matrix 5x7 Module makecode library.
 * @n This is a MakeCode graphics programming extension for YFROBOT's LED Dot Matrix 5x7 Module (TM1637).
 * 
 * @copyright    YFROBOT,2021
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2021-12-02
*/

//% color="#45b787" weight=8 icon="\uf12e"
namespace YFMATRIX57 {

    let TM1637_CMD1 = 0x40; // automatically address increases 1 mode
    let TM1637_CMD2 = 0xC0; // starting address
    let TM1637_CMD3 = 0x80;
    let count_line = 5;  // number of line, Matrix 5x7

    export enum PresetGraphList {
        //% block="Heart-❤"
        Big_Heart = 1,
        //% block="Hearts-❤"
        Small_Heart = 2,
        //% block="Smile-☺"
        Smile_Face = 3,
        //% block="Neutral-😐"
        Neutral_Face = 4,
        //% block="Sad-😞"
        Sad_Face = 5,
        //% block="Angry-😠"
        Angry_Face = 6,
        //% block="Null"
        Null = 7,
    }

    /**
     * Preset Graph.
     * @param text Preset Graph string. eg: PresetGraphList.Smile_Face
     *          Big_Heart / Small_Heart / Smile_Face / Neutral_Face / Sad_Face / Angry_Face / null
     */
    //% blockId=YFMATRIX57_presetGraph weight=29 blockGap=8
    //% block="%text"
    //% text.fieldEditor="gridpicker" text.fieldOptions.columns=2
    //% blockExternalInputs=true
    export function presetGraph(text: PresetGraphList): string {
        if (text == PresetGraphList.Big_Heart) { //"Heart-❤"
            return "B00010100,B00111110,B00111110,B00011100,B00001000"
        } else if (text == PresetGraphList.Small_Heart) { //"Hearts-❤"
            return "B00000000,B00010100,B00011100,B00001000,B00000000"
        } else if (text == PresetGraphList.Smile_Face) { //"Smile-☺"
            return "B00000000,B00010100,B00000000,B00100010,B00011100"
        } else if (text == PresetGraphList.Neutral_Face) { //"Neutral-😐"
            return "B00000000,B00110110,B00000000,B00011100,B00000000"
        } else if (text == PresetGraphList.Sad_Face) { //"Sad-😞"
            return "B00000000,B00010100,B00000000,B00011100,B00100010"
        } else if (text == PresetGraphList.Angry_Face) { //"Angry-😠"
            return "B00100010,B00010100,B00000000,B00111110,B00101010"
        } else {        //"Null"
            return "B00000000,B00000000,B00000000,B00000000,B00000000"
        }
    }

    /**
     * Customize Graph String Array.
     * @param text customize Graph string Array. eg: "B00000000,B00000000,B00000000,B00000000,B00000000"
     */
    //% blockId=YFMATRIX57_cusGraphArray weight=28 blockGap=8
    //% block="%text"
    //% blockExternalInputs=true
    export function cusGraphArray(text: string): string {
        text = "B00000000,B00000000,B00000000,B00000000,B00000000";
        return text;
    }

    /**
     * LED Dot Matrix 5x7 display(TM1637)
     */
    export class YFTM1637LEDs {
        
        clk: DigitalPin;
        dio: DigitalPin;
        _ON: number;
        brightness: number;

        /**
         * initial TM1637
         */
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            this._ON = 8;
            this.clear();
        }

        /**
         * Start 
         */
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * Stop
         */
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
        }

        /**
         * send command1
         */
        _write_data_cmd() {
            this._start();
            this._write_byte(TM1637_CMD1);
            this._stop();
        }

        /**
         * send command3
         */
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(TM1637_CMD3 | this._ON | this.brightness);
            this._stop();
        }

        /**
         * send a byte to 2-wire interface
         */
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * set TM1637 intensity, range is [0-8], 0 is off.
         * @param val the brightness of the TM1637, eg: 7
         */
        //% blockId="YFTM1637LEDs_set_intensity" weight=90 blockGap=8
        //% block="%yfDM57| set intensity %val"
        //% val.min=0 val.max=8
        intensity(val: number = 7) {
            if (val < 1) {
                this.off();
                return;
            }
            if (val > 8) val = 8;
            this._ON = 8;
            this.brightness = val - 1;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * set data to TM1637, with given bit
         */
        _dat(bit: number, dat: number) {
            this._write_data_cmd();
            this._start();
            this._write_byte(TM1637_CMD2 | bit)
            this._write_byte(dat);
            this._stop();
            this._write_dsp_ctrl();
        }

        /**
         * show dot. 
         * @param x is the position x, eg: 0
         * @param y is the position y, eg: 0
         */
        //% blockId="YFTM1637LEDs_showdot" weight=80 blockGap=8
        //% block="%yfDM57| show dot X %x| Y %y"
        //% x.min=0 x.max=4
        //% y.min=0 y.max=6
        showdot(x: number, y: number) {
            x = Math.round(x);
            y = Math.round(y);

            let data = 0x80 >> (y+1);

            this._dat(x, data);
        }

        /**
         * show line. 
         * @param x is the position x, eg: 0
         */
        //% blockId="YFTM1637LEDs_showline" weight=70 blockGap=8
        //% block="%yfDM57| show line X %x"
        //% x.min=0 x.max=4
        showline(x: number) {
            x = Math.round(x);
            this._dat(x, 0x7F);
        }

        /**
         * Draws an image on the LED Matrix 5x7.
         * @param text the pattern of LED to turn on/off.
         */
        //% blockId=YFTM1637LEDs_showdotsCus weight=30 blockGap=8
        //% block="%yfDM57| show customize array %text=YFMATRIX57_presetGraph|"
        //% blockExternalInputs=true
        //% inlineInputMode=inline
        showdotsCus(text: string) {
            let tempTextArray: string[] = []
            let resultNumberArray: number[] = []
            let currentIndex = 0
            let currentChr = ""
            let currentNum = 0
            let columnNum = 0 
            if (text != null && text.length >= 0) {
                // seperate each byte number to a string
                while (currentIndex < text.length) {
                    tempTextArray.push(text.substr(currentIndex + 1, 8))
                    currentIndex += 10
                }
                for (let i = 0; i < tempTextArray.length; i++) {
                    columnNum = 0
                    // read each bit and calculate the decimal sum
                    for (let j = tempTextArray[i].length - 1; j >= 0; j--) {
                        currentChr = tempTextArray[i].substr(j, 1)
                        if (currentChr == "1" || currentChr == "0")
                            currentNum = parseInt(currentChr)
                        else
                            currentNum = 0
                        columnNum += (2 ** (tempTextArray[i].length - j - 1)) * currentNum
                    }
                    // generate new decimal array 
                    resultNumberArray.push(columnNum)
                    this._dat(i, columnNum)
                }
            }
        }

        /**
         * clear LED. 
         */
        //% blockId="YFTM1637LEDs_clear" weight=20 blockGap=8
        //% block="%yfDM57| clear"
        clear() {
            for (let i = 0; i < count_line; i++) {
                this._dat(i, 0)
            }
        }

        /**
         * turn off LED. 
         */
        off() {
            this._ON = 0;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
    }

    /**
     * create a YFMATRIX57 object.
     * @param clk the CLK pin for YFMATRIX57, eg: DigitalPin.P1
     * @param dio the DIO pin for YFMATRIX57, eg: DigitalPin.P2
     */
    //% blockId="YFMATRIX57_create"  weight=100 blockGap=8
    //% block="Initialize dot matrix 57 CLK %clk| DIO %dio"
    //% blockSetVariable=yfDM57
    //% inlineInputMode=inline
    export function createDotMatrix57(clk: DigitalPin, dio: DigitalPin): YFTM1637LEDs {
        let yfDM57 = new YFTM1637LEDs();

        yfDM57.clk = clk;
        yfDM57.dio = dio;

        yfDM57.brightness = 7;  // Default brightness 7
        yfDM57.init();

        return yfDM57;
    }

}
