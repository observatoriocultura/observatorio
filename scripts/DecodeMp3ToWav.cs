using System;
using System.IO;
using System.Runtime.InteropServices;

internal static class DecodeMp3ToWav
{
    private const int MF_VERSION = 0x00020070;
    private const int MF_SOURCE_READER_FIRST_AUDIO_STREAM = unchecked((int)0xFFFFFFFD);
    private const int MF_SOURCE_READERF_ENDOFSTREAM = 0x00000002;
    private const int MF_SOURCE_READERF_CURRENTMEDIATYPECHANGED = 0x00000020;

    private static readonly Guid MFMediaType_Audio = new Guid("73647561-0000-0010-8000-00AA00389B71");
    private static readonly Guid MFAudioFormat_PCM = new Guid("00000001-0000-0010-8000-00AA00389B71");
    private static readonly Guid MF_MT_MAJOR_TYPE = new Guid("48eba18e-f8c9-4687-bf11-0a74c9f96a8f");
    private static readonly Guid MF_MT_SUBTYPE = new Guid("f7e34c9a-42e8-4714-b74b-cb29d72c35e5");
    private static readonly Guid MF_MT_AUDIO_NUM_CHANNELS = new Guid("37e48bf5-645e-4c5b-89de-ada9e29b696a");
    private static readonly Guid MF_MT_AUDIO_SAMPLES_PER_SECOND = new Guid("5faeeae7-0290-4c31-9e8a-c534f68d9dba");
    private static readonly Guid MF_MT_AUDIO_BITS_PER_SAMPLE = new Guid("f2deb57f-40fa-4764-aa33-ed4f2d1ff669");
    private static readonly Guid MF_MT_AUDIO_BLOCK_ALIGNMENT = new Guid("322de230-9eeb-43bd-ab7a-ff412251541d");
    private static readonly Guid MF_MT_AUDIO_AVG_BYTES_PER_SECOND = new Guid("1aab75c8-cfef-451c-ab95-ac034b8e1731");
    private static readonly Guid MF_MT_ALL_SAMPLES_INDEPENDENT = new Guid("c9173739-5e56-461c-b713-46fb995cb95f");

    public static int Main(string[] args)
    {
        if (args.Length != 2)
        {
            Console.Error.WriteLine("Usage: DecodeMp3ToWav <input.mp3> <output.wav>");
            return 2;
        }

        try
        {
            Decode(args[0], args[1]);
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            return 1;
        }
    }

    private static void Decode(string inputPath, string outputPath)
    {
        Check(MFStartup(MF_VERSION, 0), "MFStartup");
        try
        {
            IMFSourceReader reader;
            Check(MFCreateSourceReaderFromURL(inputPath, IntPtr.Zero, out reader), "MFCreateSourceReaderFromURL");

            IMFMediaType outType;
            Check(MFCreateMediaType(out outType), "MFCreateMediaType");
            Check(outType.SetGUID(MF_MT_MAJOR_TYPE, MFMediaType_Audio), "Set major type");
            Check(outType.SetGUID(MF_MT_SUBTYPE, MFAudioFormat_PCM), "Set subtype");
            Check(outType.SetUINT32(MF_MT_AUDIO_NUM_CHANNELS, 1), "Set channels");
            Check(outType.SetUINT32(MF_MT_AUDIO_SAMPLES_PER_SECOND, 16000), "Set sample rate");
            Check(outType.SetUINT32(MF_MT_AUDIO_BITS_PER_SAMPLE, 16), "Set bits");
            Check(outType.SetUINT32(MF_MT_AUDIO_BLOCK_ALIGNMENT, 2), "Set block align");
            Check(outType.SetUINT32(MF_MT_AUDIO_AVG_BYTES_PER_SECOND, 32000), "Set avg bytes");
            Check(outType.SetUINT32(MF_MT_ALL_SAMPLES_INDEPENDENT, 1), "Set independent samples");
            Check(reader.SetCurrentMediaType(MF_SOURCE_READER_FIRST_AUDIO_STREAM, IntPtr.Zero, outType), "SetCurrentMediaType");

            using (var output = new FileStream(outputPath, FileMode.Create, FileAccess.ReadWrite, FileShare.None))
            {
                WriteWavHeader(output, 0);
                long dataBytes = 0;

                while (true)
                {
                    int streamIndex;
                    int flags;
                    long timestamp;
                    IMFSample sample;
                    Check(reader.ReadSample(MF_SOURCE_READER_FIRST_AUDIO_STREAM, 0, out streamIndex, out flags, out timestamp, out sample), "ReadSample");

                    if ((flags & MF_SOURCE_READERF_CURRENTMEDIATYPECHANGED) != 0)
                    {
                        throw new InvalidOperationException("Media type changed while decoding.");
                    }

                    if ((flags & MF_SOURCE_READERF_ENDOFSTREAM) != 0)
                    {
                        break;
                    }

                    if (sample == null)
                    {
                        continue;
                    }

                    IMFMediaBuffer buffer;
                    Check(sample.ConvertToContiguousBuffer(out buffer), "ConvertToContiguousBuffer");
                    IntPtr ptr;
                    int maxLength;
                    int currentLength;
                    Check(buffer.Lock(out ptr, out maxLength, out currentLength), "Buffer.Lock");
                    try
                    {
                        byte[] bytes = new byte[currentLength];
                        Marshal.Copy(ptr, bytes, 0, currentLength);
                        output.Write(bytes, 0, bytes.Length);
                        dataBytes += bytes.Length;
                    }
                    finally
                    {
                        buffer.Unlock();
                        Marshal.ReleaseComObject(buffer);
                    }

                    Marshal.ReleaseComObject(sample);
                }

                output.Position = 0;
                WriteWavHeader(output, dataBytes);
            }

            Marshal.ReleaseComObject(outType);
            Marshal.ReleaseComObject(reader);
        }
        finally
        {
            MFShutdown();
        }
    }

    private static void WriteWavHeader(Stream stream, long dataBytes)
    {
        using (var writer = new BinaryWriter(stream, System.Text.Encoding.ASCII, true))
        {
            writer.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
            writer.Write((int)(36 + dataBytes));
            writer.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
            writer.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
            writer.Write(16);
            writer.Write((short)1);
            writer.Write((short)1);
            writer.Write(16000);
            writer.Write(32000);
            writer.Write((short)2);
            writer.Write((short)16);
            writer.Write(System.Text.Encoding.ASCII.GetBytes("data"));
            writer.Write((int)dataBytes);
        }
    }

    private static void Check(int hr, string name)
    {
        if (hr < 0)
        {
            Marshal.ThrowExceptionForHR(hr);
        }
    }

    [DllImport("mfplat.dll", ExactSpelling = true)]
    private static extern int MFStartup(int version, int flags);

    [DllImport("mfplat.dll", ExactSpelling = true)]
    private static extern int MFShutdown();

    [DllImport("mfplat.dll", ExactSpelling = true)]
    private static extern int MFCreateMediaType(out IMFMediaType mediaType);

    [DllImport("mfreadwrite.dll", ExactSpelling = true, CharSet = CharSet.Unicode)]
    private static extern int MFCreateSourceReaderFromURL(string url, IntPtr attributes, out IMFSourceReader sourceReader);

    [ComImport, Guid("70ae66f2-c809-4e4f-8915-bdcb406b7993"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMFSourceReader
    {
        [PreserveSig]
        int GetStreamSelection(int streamIndex, out bool selected);
        [PreserveSig]
        int SetStreamSelection(int streamIndex, bool selected);
        [PreserveSig]
        int GetNativeMediaType(int streamIndex, int mediaTypeIndex, out IMFMediaType mediaType);
        [PreserveSig]
        int GetCurrentMediaType(int streamIndex, out IMFMediaType mediaType);
        [PreserveSig]
        int SetCurrentMediaType(int streamIndex, IntPtr reserved, IMFMediaType mediaType);
        [PreserveSig]
        int SetCurrentPosition([In] ref Guid guidTimeFormat, [In] ref PropVariant position);
        [PreserveSig]
        int ReadSample(int streamIndex, int controlFlags, out int actualStreamIndex, out int streamFlags, out long timestamp, out IMFSample sample);
        [PreserveSig]
        int Flush(int streamIndex);
        [PreserveSig]
        int GetServiceForStream(int streamIndex, ref Guid service, ref Guid riid, out IntPtr ppvObject);
        [PreserveSig]
        int GetPresentationAttribute(int streamIndex, ref Guid guidAttribute, out PropVariant value);
    }

    [ComImport, Guid("44ae0fa8-ea31-4109-8d2e-4cae4997c555"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMFMediaType
    {
        [PreserveSig]
        int GetItem([In] ref Guid guidKey, IntPtr value);
        [PreserveSig]
        int GetItemType([In] ref Guid guidKey, out int type);
        [PreserveSig]
        int CompareItem([In] ref Guid guidKey, IntPtr value, out bool result);
        [PreserveSig]
        int Compare(IMFAttributes other, int matchType, out bool result);
        [PreserveSig]
        int GetUINT32([In] ref Guid guidKey, out int value);
        [PreserveSig]
        int GetUINT64([In] ref Guid guidKey, out long value);
        [PreserveSig]
        int GetDouble([In] ref Guid guidKey, out double value);
        [PreserveSig]
        int GetGUID([In] ref Guid guidKey, out Guid value);
        [PreserveSig]
        int GetStringLength([In] ref Guid guidKey, out int length);
        [PreserveSig]
        int GetString([In] ref Guid guidKey, [Out, MarshalAs(UnmanagedType.LPWStr)] System.Text.StringBuilder value, int bufferSize, out int length);
        [PreserveSig]
        int GetAllocatedString([In] ref Guid guidKey, out IntPtr value, out int length);
        [PreserveSig]
        int GetBlobSize([In] ref Guid guidKey, out int size);
        [PreserveSig]
        int GetBlob([In] ref Guid guidKey, [Out] byte[] buffer, int bufferSize, out int blobSize);
        [PreserveSig]
        int GetAllocatedBlob([In] ref Guid guidKey, out IntPtr buffer, out int size);
        [PreserveSig]
        int InitFromBlob([In] byte[] buffer, int size);
        [PreserveSig]
        int GetCount(out int count);
        [PreserveSig]
        int GetItemByIndex(int index, out Guid guidKey, IntPtr value);
        [PreserveSig]
        int CopyAllItems(IMFAttributes destination);
        [PreserveSig]
        int SetItem([In] ref Guid guidKey, IntPtr value);
        [PreserveSig]
        int DeleteItem([In] ref Guid guidKey);
        [PreserveSig]
        int DeleteAllItems();
        [PreserveSig]
        int SetUINT32([In] ref Guid guidKey, int value);
        [PreserveSig]
        int SetUINT64([In] ref Guid guidKey, long value);
        [PreserveSig]
        int SetDouble([In] ref Guid guidKey, double value);
        [PreserveSig]
        int SetGUID([In] ref Guid guidKey, [In] ref Guid value);
        [PreserveSig]
        int SetString([In] ref Guid guidKey, [MarshalAs(UnmanagedType.LPWStr)] string value);
        [PreserveSig]
        int SetBlob([In] ref Guid guidKey, [In] byte[] buffer, int size);
        [PreserveSig]
        int LockStore();
        [PreserveSig]
        int UnlockStore();
        [PreserveSig]
        int GetAllItems(IntPtr items);
    }

    [ComImport, Guid("2cd2d921-c447-44a7-a13c-4adabfc247e3"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMFAttributes
    {
    }

    [ComImport, Guid("c40a00f2-b93a-4d80-ae8c-5a1c634f58e4"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMFSample
    {
        [PreserveSig]
        int GetSampleFlags(out int sampleFlags);
        [PreserveSig]
        int SetSampleFlags(int sampleFlags);
        [PreserveSig]
        int GetSampleTime(out long sampleTime);
        [PreserveSig]
        int SetSampleTime(long sampleTime);
        [PreserveSig]
        int GetSampleDuration(out long sampleDuration);
        [PreserveSig]
        int SetSampleDuration(long sampleDuration);
        [PreserveSig]
        int GetBufferCount(out int bufferCount);
        [PreserveSig]
        int GetBufferByIndex(int index, out IMFMediaBuffer buffer);
        [PreserveSig]
        int ConvertToContiguousBuffer(out IMFMediaBuffer buffer);
        [PreserveSig]
        int AddBuffer(IMFMediaBuffer buffer);
        [PreserveSig]
        int RemoveBufferByIndex(int index);
        [PreserveSig]
        int RemoveAllBuffers();
        [PreserveSig]
        int GetTotalLength(out int totalLength);
        [PreserveSig]
        int CopyToBuffer(IMFMediaBuffer buffer);
    }

    [ComImport, Guid("045FA593-8799-42b8-BC8D-8968C6453507"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMFMediaBuffer
    {
        [PreserveSig]
        int Lock(out IntPtr buffer, out int maxLength, out int currentLength);
        [PreserveSig]
        int Unlock();
        [PreserveSig]
        int GetCurrentLength(out int currentLength);
        [PreserveSig]
        int SetCurrentLength(int currentLength);
        [PreserveSig]
        int GetMaxLength(out int maxLength);
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PropVariant
    {
        public short vt;
        public short wReserved1;
        public short wReserved2;
        public short wReserved3;
        public IntPtr p;
        public int p2;
    }
}
