import { describe, it, expect, jest, beforeEach } from "@jest/globals";

type MockApiResponse = [
  {
    fullTextAnnotation?: { text: string } | null;
  }
];

let recognizeTextFromImage: (imageUrl: string | Buffer) => Promise<string>;

const mockDocumentTextDetection = jest.fn<() => Promise<MockApiResponse>>();

jest.mock("@google-cloud/vision", () => {
  return {
    __esModule: true,
    default: {
      ImageAnnotatorClient: jest.fn().mockImplementation(() => {
        return {
          documentTextDetection: mockDocumentTextDetection,
        };
      }),
    },
  };
});

describe("OCR Service (recognizeTextFromImage)", () => {
  beforeEach(() => {
    jest.resetModules();
    recognizeTextFromImage = require("../ocr.service").recognizeTextFromImage;
    mockDocumentTextDetection.mockClear();
  });

  it("should return the recognized text when the API call is successful", async () => {
    const mockText = "This is the mocked OCR text.";

    const mockApiResponse: MockApiResponse = [
      {
        fullTextAnnotation: {
          text: mockText,
        },
      },
    ];

    mockDocumentTextDetection.mockResolvedValue(mockApiResponse);

    const imageUrl = "https://example.com/test.png";
    const result = await recognizeTextFromImage(imageUrl);

    expect(result).toBe(mockText);
  });

  it("should throw an error if the API returns no text", async () => {
    const mockEmptyResponse: MockApiResponse = [{ fullTextAnnotation: null }];

    mockDocumentTextDetection.mockResolvedValue(mockEmptyResponse);

    const imageUrl = "https://example.com/empty.png";

    await expect(recognizeTextFromImage(imageUrl)).rejects.toThrow(
      "Failed to recognize text using Google Cloud Vision API."
    );
  });
});
