# Local ASR Benchmark Harness

This directory supports the key-free feasibility spike for Quran recitation revision.

## Purpose

Run local transcription baselines on a short, constrained sample set and score the outputs against expected Quran text using shared normalization rules.

## Layout

```text
benchmarks/asr/
├── manifests/
│   └── phase2-sample-set.json
├── runs/
│   └── .gitkeep
├── samples/
│   └── .gitkeep
└── normalization-rules.md
```

## Workflow

1. Put mobile-recorded sample audio files into `benchmarks/asr/samples/`.
2. Update `manifests/phase2-sample-set.json` with real sample metadata.
3. Run a local transcription baseline with:

```sh
bash ./scripts/asr-run-local.sh \
  --manifest benchmarks/asr/manifests/phase2-sample-set.json \
  --provider whisper-cpp \
  --output-dir benchmarks/asr/runs/whisper-cpp
```

By default, the local runner forces CPU mode with `--no-gpu` for stability on Macs where Metal initialization can crash. If you later want to try GPU mode explicitly, set:

```sh
export WHISPER_CPP_USE_GPU=1
```

4. Score the transcript outputs with:

```sh
python3 ./scripts/asr-benchmark.py \
  --manifest benchmarks/asr/manifests/phase2-sample-set.json \
  --transcript-dir benchmarks/asr/runs/whisper-cpp \
  --provider whisper-cpp \
  --output-json benchmarks/asr/runs/whisper-cpp/results.json \
  --output-md benchmarks/asr/runs/whisper-cpp/results.md
```

## Expectations

- This harness is for feasibility, not production.
- The first useful outcome is a trustworthy `go / narrow / stop` recommendation.
- If local baseline quality is weak, that is still valuable evidence.
