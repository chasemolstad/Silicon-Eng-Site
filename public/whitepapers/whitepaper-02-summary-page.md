# Analog and Power IC Test Development: A Field Guide to Pitfalls and Good Practice

**A SiliconEng white paper — summary — aligned to Paper 2 Version 1.8**

---

Digital test asks whether the right bit came out at the right time. Analog and power test asks something harder: is this voltage, this current, really what the datasheet says it should be — and can you prove it with the instrument you are measuring it with?

That is the difference this paper is about. In analog and power test, the tester is part of the measurement. Every source, digitizer, relay, cable, socket contact, and inch of loadboard copper between the tester and the device adds error to the number you record. If you do not budget that error, you are not testing the part — you are testing your setup, and calling the result the part's performance.

This paper is the companion to *From Datasheet to ATE*, which covered the method: extraction, normalization, test plan, limits. This one covers the traps that method runs into in practice.

## The first rule: the tester is in the measurement

Metrology's rule of thumb is a test uncertainty ratio (TUR) of 10:1 — the measurement should be at least ten times more accurate than the tolerance it verifies. 4:1 is the minimum for a defensible production test, with a documented guardband. Below that, you are making decisions with an instrument nearly as uncertain as the thing it judges.

Two ordinary parts show why the rule bites. TI's INA333 instrumentation amplifier has a maximum input offset of 25.75 µV at a gain of 100 — but because the INA333 is itself the gain stage, that offset appears at its output already multiplied, as 2.575 mV. With an illustrative ±0.5 mV digitizer, that is a 5:1 problem, not a 200:1 one: the test is hard not because the number is small, but because the digitizer's error is a large fraction of the amplified number. TI's TPS54360 buck regulator makes the same point from the other side: its 0.8 V reference is specified 0.792–0.808 V, a 16 mV band — but production never tests the reference. It tests the output voltage, set by a resistor divider off that reference, and the divider tolerance, load regulation, and contact resistance all join the error budget. The datasheet number is never the number you measure.

## When you cannot get 10:1: ways around it

Sometimes the honest answer is that the tester, as configured, is not good enough. That is a reason to change the measurement, not to ship the test anyway. The paper works through the fixes that actually work, in rough order of cost: spot calibration at the test point (not the factory calibration), an external precision instrument switched into the path, a precision post-amplifier on the loadboard, averaging (and what averaging cannot fix), Kelvin sensing, nulling, and bracketing, correlation instead of duplication — and, when every workaround is spent, saying so and guardbanding by the full measurement uncertainty.

## Two worked examples: where the traps actually are

**The buck regulator (TPS54360): power makes every error bigger.** Output accuracy means testing the chain, not the reference — 1% divider resistors alone contribute up to ~2% worst-case ratio error, more than the reference's own ±1% band. Current limit is specified under open-loop conditions, so a production test that simply loads the output until the converter gives up is measuring something else. A 500 kHz waveform with a 135 ns minimum on-time needs real measurement bandwidth, or the error shows up as frequency shifts that look like part variation. Efficiency is four measurements with compounding errors. And at 3.5 A, the part heats itself while you watch — a cold part measured, then a hot part, is your own test sequence, not variation.

**The instrumentation amplifier (INA333): small signals, hostile environment.** Offset must be measured at gain and reported input-referred, dividing by measured gain, not nominal. Drift is about 0.105 µV/°C at a gain of 100 — smaller than the thermal EMF of a single relay junction, so the setup must drift less than the part. CMRR of 100 dB means a 5 V common-mode step may produce only 50 µV of input-referred error, and the REF pin tolerates 15 Ω or less of stray resistance before CMRR degrades. Bias current is ±200 pA maximum — less than the leakage of a dirty socket or a flux residue. Noise, settling (400 µs to 0.01% at a gain of 100), and a bias-current return path each get their own trap.

## The rest of the paper

**Socket selection and layout** as part of the instrument: contact current and wear, Kelvin discipline in copper, loop inductance in fast high-current paths, leakage and capacitance on precision nodes, thermal path, and pin sequencing. **Simulation before copper** — LTspice, TINA-TI, PSpice, and SIMPLIS — used to model the test circuit with its parasitics, preview the transients you are afraid of, and choose between methods before the board exists. **Gauge R&R and the deep dive**: under 10% of tolerance is good, 10–30% conditional, over 30% not acceptable, with ndc ≥ 5 — run on the production setup, not the bench — plus reading data as distributions: bimodality, clipping, site deltas, bench correlation, drift over time, honest outliers. **The spike check**: every pin, through every transition, against absolute maximum ratings, with the simple fixes — sequence power before signals and ground first, never hot-switch relays, series resistance, clamps, snubbers, slew control, discharge paths.

## What you get in the full paper

All ten sections: why analog and power test is different, the 10:1 rule and the uncertainty stack, the seven workarounds, both worked examples with their traps, socket and layout, simulation, gauge R&R and the data deep dive, the spike check with its absolute-maximum table, and the 14-point good-practice checklist to run during test development.

---

**Download the full white paper** — the 10:1 rule with real numbers, both worked examples, and the checklist.

[Name] [Work email] [Company] [ Download ]

*SiliconEng is a post-silicon engineering services company in California — analog, power management, RF, and mixed-signal ICs. ATE test programs, product qualification, silicon validation and characterization. Competence, customer care, continuous improvement.*
