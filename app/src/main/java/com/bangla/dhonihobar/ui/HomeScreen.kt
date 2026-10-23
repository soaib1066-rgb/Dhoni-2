package com.bangla.dhonihobar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bangla.dhonihobar.ui.theme.*
import com.bangla.dhonihobar.util.BanglaFormatter

@Composable
fun HomeScreen(
    onStartBot: () -> Unit,
    onStartMultiplayer: (Int) -> Unit
) {
    var selectedPlayers by remember { mutableStateOf(2) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = SlateSurface),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(EmeraldPrimary.copy(alpha = 0.4f)))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Game Title
                Text(
                    text = "ধনী হবার মজার খেলা",
                    style = MaterialTheme.typography.titleLarge,
                    color = GoldAccent,
                    fontWeight = FontWeight.Black,
                    fontSize = 26.sp
                )

                Text(
                    text = "বাংলাদেশের ঐতিহ্যবাহী 2D বোর্ড গেম",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextMuted,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Mode A: Bot
                Button(
                    onClick = onStartBot,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                ) {
                    Text(
                        text = "বটের সঙ্গে খেলুন (AI বনাম আপনি)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 15.sp
                    )
                }

                // Mode B: Friends
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SlateCard)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "বন্ধুদের সঙ্গে খেলুন (একই ডিভাইসে)",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextLight
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "খেলোয়াড় সংখ্যা:",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextMuted
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf(2, 3, 4).forEach { count ->
                                    OutlinedButton(
                                        onClick = { selectedPlayers = count },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(
                                            containerColor = if (selectedPlayers == count) PlayerBlue else Color.Transparent,
                                            contentColor = if (selectedPlayers == count) Color.White else TextMuted
                                        ),
                                        modifier = Modifier.size(38.dp),
                                        contentPadding = PaddingValues(0.dp)
                                    ) {
                                        Text(
                                            text = BanglaFormatter.toBanglaNumber(count),
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }

                        Button(
                            onClick = { onStartMultiplayer(selectedPlayers) },
                            modifier = Modifier.fillMaxWidth().height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PlayerBlue)
                        ) {
                            Text(
                                text = "${BanglaFormatter.toBanglaNumber(selectedPlayers)} জন খেলোয়াড় শুরু করুন",
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
