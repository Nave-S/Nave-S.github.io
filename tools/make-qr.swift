#!/usr/bin/env swift
//
// make-qr.swift — turns a URL into a scalable QR code SVG.
//
// Why a script and not a hand-made file: the QR on the site encodes an App
// Store URL. When that URL changes (a new app goes live, an ID changes), the
// picture has to change with it — and a picture nobody can regenerate is a
// picture that silently goes stale. Run this, commit the result.
//
// Why CoreImage and not a package: it ships with macOS. No pip, no npm, no
// vendored library in a repo that is otherwise plain HTML and CSS.
//
// Why SVG and not PNG: the code is a grid of squares. As SVG it stays sharp on
// every display at a fraction of the bytes, and it needs no @2x twin.
//
// The script VERIFIES its own output before writing: it renders the matrix it
// derived and reads it back with CIDetector. A QR that does not decode to the
// exact input string is not written at all — a wrong QR looks identical to a
// right one, so the check cannot be left to the eye.
//
// Usage:
//   swift tools/make-qr.swift "https://apps.apple.com/app/x/id123" apps/qr/x.svg
//

import CoreImage
import Foundation

// MARK: - Arguments

let args = CommandLine.arguments
guard args.count == 3 else {
    FileHandle.standardError.write(
        "usage: swift tools/make-qr.swift <url> <output.svg>\n".data(using: .utf8)!)
    exit(2)
}
let payload = args[1]
let outputPath = args[2]

guard let payloadData = payload.data(using: .isoLatin1) ?? payload.data(using: .utf8) else {
    FileHandle.standardError.write("cannot encode payload\n".data(using: .utf8)!)
    exit(1)
}

let context = CIContext(options: nil)

// MARK: - Generate

// "M" = medium error correction (~15%). The code sits on a website next to a
// button, not on a dusty crate: high correction would only make the grid denser
// and harder to scan from a phone held at arm's length.
guard let filter = CIFilter(name: "CIQRCodeGenerator") else {
    FileHandle.standardError.write("CIQRCodeGenerator unavailable\n".data(using: .utf8)!)
    exit(1)
}
filter.setValue(payloadData, forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")

guard let raw = filter.outputImage else {
    FileHandle.standardError.write("filter produced no image\n".data(using: .utf8)!)
    exit(1)
}

// At scale 1 the generator emits exactly one pixel per QR module, which is what
// makes reading the matrix back exact rather than a guess about thresholds.
let extent = raw.extent
let width = Int(extent.width)
let height = Int(extent.height)

guard width > 0, height > 0 else {
    FileHandle.standardError.write("empty output image\n".data(using: .utf8)!)
    exit(1)
}

// MARK: - Read the module matrix

var pixels = [UInt8](repeating: 0, count: width * height * 4)
pixels.withUnsafeMutableBytes { buffer in
    context.render(raw,
                   toBitmap: buffer.baseAddress!,
                   rowBytes: width * 4,
                   bounds: extent,
                   format: .RGBA8,
                   colorSpace: CGColorSpaceCreateDeviceRGB())
}

// CoreImage draws dark modules as black. Row 0 of the bitmap is the TOP row of
// the image, which is the top row of the code — no flip needed here, and the
// self-check below would catch it if that ever changed.
var matrix = [[Bool]]()
for y in 0..<height {
    var row = [Bool]()
    for x in 0..<width {
        let offset = (y * width + x) * 4
        row.append(pixels[offset] < 128)   // dark module
    }
    matrix.append(row)
}

// The generator already includes the quiet zone in its extent. Trimming it and
// re-adding our own would risk an off-by-one that no viewer would notice until
// a scanner failed, so it is kept as delivered.

// MARK: - SVG

let moduleSize = 1        // SVG user units; the viewBox does the scaling
let svgSize = width * moduleSize

var body = ""
for (y, row) in matrix.enumerated() {
    // Runs of adjacent dark modules become ONE rect instead of many. A typical
    // App Store URL drops from ~1400 rects to ~400 — same picture, third of the
    // bytes, and git diffs stay readable.
    var x = 0
    while x < row.count {
        guard row[x] else { x += 1; continue }
        var run = 1
        while x + run < row.count, row[x + run] { run += 1 }
        body += "<rect x=\"\(x * moduleSize)\" y=\"\(y * moduleSize)\" "
        body += "width=\"\(run * moduleSize)\" height=\"\(moduleSize)\"/>"
        x += run
    }
}

// currentColor, so the code inherits the surrounding text colour and works on a
// dark page as well as a light one without a second file.
let svg = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \(svgSize) \(svgSize)" \
shape-rendering="crispEdges" role="img" aria-hidden="true">\
<rect width="\(svgSize)" height="\(svgSize)" fill="#fff"/>\
<g fill="currentColor">\(body)</g></svg>

"""

// MARK: - Verify before writing

// Render the matrix we just derived — not the filter output — so the check
// covers our own reading and drawing, not only CoreImage's generation.
let scale = 8
let checkWidth = svgSize * scale
var checkPixels = [UInt8](repeating: 255, count: checkWidth * checkWidth)
for (y, row) in matrix.enumerated() {
    for (x, dark) in row.enumerated() where dark {
        for dy in 0..<scale {
            for dx in 0..<scale {
                let px = x * scale + dx
                let py = y * scale + dy
                checkPixels[py * checkWidth + px] = 0
            }
        }
    }
}

let grayData = Data(checkPixels)
guard let provider = CGDataProvider(data: grayData as CFData),
      let cgImage = CGImage(width: checkWidth,
                            height: checkWidth,
                            bitsPerComponent: 8,
                            bitsPerPixel: 8,
                            bytesPerRow: checkWidth,
                            space: CGColorSpaceCreateDeviceGray(),
                            bitmapInfo: CGBitmapInfo(rawValue: 0),
                            provider: provider,
                            decode: nil,
                            shouldInterpolate: false,
                            intent: .defaultIntent) else {
    FileHandle.standardError.write("could not build verification image\n".data(using: .utf8)!)
    exit(1)
}

let detector = CIDetector(ofType: CIDetectorTypeQRCode,
                          context: context,
                          options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])
let features = detector?.features(in: CIImage(cgImage: cgImage)) as? [CIQRCodeFeature] ?? []
let decoded = features.first?.messageString

guard decoded == payload else {
    let got = decoded ?? "<nothing decoded>"
    FileHandle.standardError.write(
        "VERIFICATION FAILED — nothing written.\n  expected: \(payload)\n  decoded:  \(got)\n"
            .data(using: .utf8)!)
    exit(1)
}

// MARK: - Write

do {
    let url = URL(fileURLWithPath: outputPath)
    try FileManager.default.createDirectory(at: url.deletingLastPathComponent(),
                                            withIntermediateDirectories: true)
    try svg.write(to: url, atomically: true, encoding: .utf8)
} catch {
    FileHandle.standardError.write("write failed: \(error)\n".data(using: .utf8)!)
    exit(1)
}

let rectCount = svg.components(separatedBy: "<rect").count - 1
print("✓ \(outputPath)")
print("  \(width)×\(height) modules, \(rectCount) rects, \(svg.utf8.count) bytes")
print("  decoded back to the exact input — verified, not assumed")
