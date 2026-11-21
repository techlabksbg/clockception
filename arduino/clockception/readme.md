# Animation and I2C Protocol
  * **Position**: 16-bit signed: unit steps, from -32'000 - 32'000 (16 revolutions)
  * **Velocity**: 16-bit signed: unit steps/s * 100  -> Maxspeed would be 33'333, so 32'000
  * **Time**: 16-bit unsigned: unit 0.001 s  -> Maxtime is about 65s

## Protocol
  * Command Animation start, number of entries, as a single unsigned byte
  * Command Animation data, 6 Bytes (max 40 entries -> 240 bytes)
  * Broadcast Command to start Animation

|Name | Address | Command | Params | Description |
| --- | ------- | ------- | ------ | ----------- |
| Home |   both     |    0    |  None  |  Reset (Home) |
| DataM1 | individual | 1 | 6*numframes Bytes | 
| DataM2 | individual | 2 | 6*numframes Bytes | 
| Start | broadcast | 15 | None | Start Animation |
| Query | individual | 16 | None | Request state, s,v as above |

