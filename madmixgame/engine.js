// Uses the unmodified JSSpeccy 3.2 Z80 core (GPL-3.0, source in vendor/jsspeccy).
(() => {
  "use strict";

  const pageSize = 0x4000;
  const romPage = 10;
  const frameBytes = 0x6600;
  const screenWidth = 320;
  const screenHeight = 240;

  function decode(data) {
    return Uint8Array.from(atob(data), (byte) => byte.charCodeAt(0));
  }

  async function loadBootSnapshot(snapshot, machine) {
    const view = new DataView(snapshot.buffer);
    if (view.getUint32(0) !== 0x5a585354 || view.getUint8(6) !== 1) {
      throw new Error("Expected the Spectrum 48K tape loader");
    }

    for (let offset = 8; offset < snapshot.length;) {
      const id = String.fromCharCode(...snapshot.subarray(offset, offset + 4));
      const end = offset + 8 + view.getUint32(offset + 4, true);
      offset += 8;

      if (id === "RAMP") {
        const page = snapshot[offset + 2];
        let bytes = snapshot.subarray(offset + 3, end);
        if (view.getUint16(offset, true) & 1) {
          const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
          bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        }
        machine.loadPage(page, bytes);
      } else if (id === "Z80R") {
        for (let i = 0; i < 11; i++) machine.registers[i] = view.getUint16(offset + i * 2, true);
        machine.registers[11] = view.getUint16(offset + 24);
        machine.core.setPC(view.getUint16(offset + 22, true));
        machine.core.setIFF1(snapshot[offset + 26]);
        machine.core.setIFF2(snapshot[offset + 27]);
        machine.core.setIM(snapshot[offset + 28]);
        machine.core.setTStates(view.getUint32(offset + 29, true));
        machine.core.setHalted(Boolean(snapshot[offset + 37] & 2));
      } else if (id === "SPCR") {
        machine.core.writePort(0x00fe, snapshot[offset]);
      }
      offset = end;
    }
  }

  class Spectrum48 {
    static async load({ core, rom, loader, tape }) {
      const { instance } = await WebAssembly.instantiate(decode(core));
      const machine = new Spectrum48(instance.exports, new globalThis.SpectrumTape(decode(tape).buffer));
      machine.core.setMachineType(48);
      machine.loadPage(romPage, decode(rom));
      await loadBootSnapshot(decode(loader), machine);
      machine.core.setTapeTraps(true);
      return machine;
    }

    constructor(core, tape) {
      this.core = core;
      this.tape = tape;
      this.memory = new Uint8Array(core.memory.buffer);
      this.registers = new Uint16Array(core.memory.buffer, Number(core.REGISTERS), 12);
      this.frame = new Uint8Array(core.memory.buffer, Number(core.FRAME_BUFFER), frameBytes);
    }

    loadPage(page, bytes) {
      this.memory.set(bytes, Number(this.core.MACHINE_MEMORY) + page * pageSize);
    }

    loadTapeBlock() {
      const block = this.tape.getNextLoadableBlock();
      const [flags, expectedLength, start] = [this.registers[4], this.registers[2], this.registers[8]];
      let success = block?.[0] === (flags >> 8);
      if (success && (flags & 1)) {
        let checksum = block[0];
        const count = Math.min(expectedLength, block.length - 1);
        for (let i = 0; i < count; i++) {
          const byte = block[i + 1];
          this.core.poke((start + i) & 0xffff, byte);
          checksum ^= byte;
        }
        success = count === expectedLength && block[count + 1] === checksum;
      }
      this.registers[0] = (this.registers[0] & 0xfffe) | Number(success);
      this.core.setPC(0x05e2);
    }

    step(audioSamples = 0) {
      this.core.setAudioSamplesPerFrame(audioSamples);
      let status = this.core.runFrame();
      while (status === 2) {
        this.loadTapeBlock();
        status = this.core.resumeFrame();
      }
      if (status) throw new Error("Unexpected Z80 frame result: " + status);
    }

    audio(samples) {
      return new Float32Array(this.core.memory.buffer, Number(this.core.AUDIO_BUFFER_LEFT), samples);
    }

    key(row, mask, pressed) {
      if (pressed) this.core.keyDown(row, mask);
      else this.core.keyUp(row, mask);
    }
  }

  class SpectrumDisplay {
    constructor(canvas) {
      this.context = canvas.getContext("2d", { alpha: false });
      this.image = this.context.createImageData(screenWidth, screenHeight);
      this.pixels = new Uint32Array(this.image.data.buffer);
      const channels = new Uint8ClampedArray(16 * 4);
      for (let index = 0; index < 16; index++) {
        const intensity = index & 8 ? 255 : 190;
        const value = index === 7 ? 170 : intensity;
        channels.set([
          index & 2 ? value : 0,
          index & 4 ? value : 0,
          index & 1 ? value : 0,
          255,
        ], index * 4);
      }
      this.palette = new Uint32Array(channels.buffer);
    }

    draw(bytes, frame) {
      const flash = (frame & 16) !== 0;
      const { palette, pixels } = this;
      let source = 0;
      let destination = 0;
      const border = (pairs) => {
        for (let i = 0; i < pairs; i++) {
          const color = palette[bytes[source++] & 7];
          pixels[destination++] = color;
          pixels[destination++] = color;
        }
      };

      border(24 * 160);
      for (let y = 0; y < 192; y++) {
        border(16);
        for (let x = 0; x < 32; x++) {
          const pattern = bytes[source++];
          const attr = bytes[source++];
          const bright = (attr & 64) >> 3;
          let ink = palette[bright | (attr & 7)];
          let paper = palette[bright | ((attr >> 3) & 7)];
          if (flash && (attr & 128)) [ink, paper] = [paper, ink];
          for (let bit = 128; bit; bit >>= 1) pixels[destination++] = pattern & bit ? ink : paper;
        }
        border(16);
      }
      border(24 * 160);
      this.context.putImageData(this.image, 0, 0);
    }
  }

  globalThis.Spectrum48 = Spectrum48;
  globalThis.SpectrumDisplay = SpectrumDisplay;
})();
