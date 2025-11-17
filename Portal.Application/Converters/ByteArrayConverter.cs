using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Portal.Application.Converters
{
    public class ByteArrayConverter : JsonConverter<byte[]>
    {
        public override byte[] Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return Array.Empty<byte>();
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                // Handle base64 string
                var base64String = reader.GetString();
                if (string.IsNullOrEmpty(base64String))
                {
                    return Array.Empty<byte>();
                }
                return Convert.FromBase64String(base64String);
            }

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                // Handle number array [1,2,3...]
                var byteList = new System.Collections.Generic.List<byte>();
                while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                {
                    if (reader.TokenType == JsonTokenType.Number)
                    {
                        // Handle all numeric types (int, long, double, etc.)
                        long value;
                        if (reader.TryGetInt64(out value))
                        {
                            // Successfully read as Int64
                        }
                        else
                        {
                            // Try reading as double and convert
                            var doubleValue = reader.GetDouble();
                            value = (long)Math.Round(doubleValue);
                        }
                        
                        if (value < 0 || value > 255)
                        {
                            throw new JsonException($"Byte value out of range: {value}. Must be between 0 and 255.");
                        }
                        byteList.Add((byte)value);
                    }
                    else if (reader.TokenType == JsonTokenType.Null)
                    {
                        // Skip null values
                        continue;
                    }
                    else
                    {
                        throw new JsonException($"Unexpected token type: {reader.TokenType}. Expected number.");
                    }
                }
                return byteList.ToArray();
            }

            throw new JsonException($"Unexpected token type: {reader.TokenType}. Expected string or array.");
        }

        public override void Write(Utf8JsonWriter writer, byte[] value, JsonSerializerOptions options)
        {
            if (value == null || value.Length == 0)
            {
                writer.WriteNullValue();
                return;
            }

            // Write as base64 string for better JSON size efficiency
            writer.WriteStringValue(Convert.ToBase64String(value));
        }
    }
}

