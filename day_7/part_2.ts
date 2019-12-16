import { put, take } from '@paybase/csp';
import IntcodeCPU from '../tools/intcode_cpu_v3';
import getProgram, { Test } from './programs-2';
import { makeChan, perms } from './utils';

const main = async (programName: Test) => {
  const channelStart = makeChan();
  const channelAB = makeChan();
  const channelBC = makeChan();
  const channelCD = makeChan();
  const channelDE = makeChan();
  const channelEA = makeChan(); // Loopback channel
  const channelEnd = makeChan();

  const program = getProgram(programName);

  // Initializing

  const AmpA = new IntcodeCPU(program, [channelStart, channelEA], channelAB);
  const AmpB = new IntcodeCPU(program, [channelAB], channelBC);
  const AmpC = new IntcodeCPU(program, [channelBC], channelCD);
  const AmpD = new IntcodeCPU(program, [channelCD], channelDE);
  const AmpE = new IntcodeCPU(program, [channelDE], channelEA, channelEnd);

  const phaseSettings = perms([5, 6, 7, 8, 9]);
  let best = {
    setting: phaseSettings[0],
    value: 0,
  };

  for (const setting of phaseSettings) {
    const [settingA, settingB, settingC, settingD, settingE] = setting;

    // Loading and setting phase

    AmpA.load();
    AmpA.exec();
    await put(channelStart, settingA);

    AmpB.load();
    AmpB.exec();
    await put(channelAB, settingB);

    AmpC.load();
    AmpC.exec();
    await put(channelBC, settingC);

    AmpD.load();
    AmpD.exec();
    await put(channelCD, settingD);

    AmpE.load();
    AmpE.exec();
    await put(channelDE, settingE);

    // Launching amplification

    await put(channelStart, 0);

    // Awaiting output

    const thrusterValue = await take(channelEnd);
    console.log(`Received thruster value of ${thrusterValue} for settings ${JSON.stringify(setting)}`);

    if (thrusterValue > best.value) {
      console.log('Found new high thrust value');
      best = {
        setting,
        value: thrusterValue
      };
    }
  }

  console.log(`Highest thruster value was ${best.value} for ${JSON.stringify(best.setting)}`);
};

main(Test.FINAL);
