export const SWIFT_UI_CODE = `// FlipStreamApp.swift — Native iOS 18+ SwiftUI Implementation
// Features: Vertical Paging Snap Deck, Pure Midnight OLED Eye-Care Theme, RSS Parser & Reader Mode

import SwiftUI

enum EyeTheme: String, CaseIterable {
    case oledMidnight = "Pure Midnight OLED"
    case warmSepia = "Warm Sepia Paper"
    case einkSlate = "Matte E-Ink Slate"
    
    var background: Color {
        switch self {
        case .oledMidnight: return Color.black
        case .warmSepia: return Color(red: 0.968, green: 0.957, blue: 0.933)
        case .einkSlate: return Color(red: 0.094, green: 0.102, blue: 0.122)
        }
    }
    
    var primaryText: Color {
        switch self {
        case .oledMidnight: return Color(red: 0.88, green: 0.91, blue: 0.94)
        case .warmSepia: return Color(red: 0.11, green: 0.098, blue: 0.09)
        case .einkSlate: return Color(red: 0.82, green: 0.84, blue: 0.86)
        }
    }
}

struct Article: Identifiable {
    let id = UUID()
    let issue: String
    let source: String
    let category: String
    let title: String
    let subtitle: String
    let author: String
    let readTime: String
    let body: [String]
}

@main
struct FlipStreamApp: App {
    var body: some Scene {
        WindowGroup {
            FlipStreamMainView()
                .preferredColorScheme(.dark)
        }
    }
}

struct FlipStreamMainView: View {
    @State private var selectedTheme: EyeTheme = .oledMidnight
    @State private var amberShieldOpacity: Double = 0.18
    @State private var activeArticle: Article? = nil
    @State private var currentPage: Int = 0
    
    let articles: [Article] = [
        Article(
            issue: "ISSUE NO. 48 · TECH",
            source: "Ars Technica",
            category: "Tech",
            title: "Sub-Nanometer Photonic Interconnects Redefine Wafer-Scale Silicon Efficiency",
            subtitle: "Optical waveguides etched directly onto crystalline silicon cut thermal dissipation by 64%.",
            author: "Dr. Lukas Vance",
            readTime: "5 min read",
            body: [
                "During the past decade, the primary bottleneck in high-performance computing has shifted from transistor switching speed to the energetic cost of moving electrons across millimeters of copper interconnect.",
                "Now, a consortium of lithography physicists has unveiled a dual-stage ultraviolet fabrication method that integrates silicon nitride waveguides directly into 300mm wafer runs."
            ]
        )
    ]
    
    var body: some View {
        ZStack {
            selectedTheme.background.ignoresSafeArea()
            
            // Vertical Full-Screen Paging Reader Cards (iOS 17+ ScrollView Paging)
            ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    ForEach(articles) { article in
                        VerticalStoryCard(article: article, theme: selectedTheme) {
                            activeArticle = article
                        }
                        .containerRelativeFrame([.horizontal, .vertical])
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.paging)
            .ignoresSafeArea()
            
            // 2700K Eye-Protective Amber Night-Shift Shield Overlay
            Color(red: 0.96, green: 0.62, blue: 0.04)
                .opacity(amberShieldOpacity * 0.25)
                .blendMode(.multiply)
                .allowsHitTesting(false)
                .ignoresSafeArea()
        }
        .sheet(item: $activeArticle) { article in
            ReaderSheetView(article: article, theme: selectedTheme)
        }
    }
}

struct VerticalStoryCard: View {
    let article: Article
    let theme: EyeTheme
    let onReadMore: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            Text("\\(article.source) · \\(article.category) · \\(article.readTime)")
                .font(.caption)
                .tracking(1.4)
                .foregroundStyle(theme.primaryText.opacity(0.65))
            
            Text(article.title)
                .font(.system(size: 30, weight: .semibold, design: .serif))
                .foregroundStyle(theme.primaryText)
                .lineSpacing(4)
            
            Text(article.subtitle)
                .font(.system(size: 16, weight: .regular, design: .serif))
                .foregroundStyle(theme.primaryText.opacity(0.78))
            
            Button(action: onReadMore) {
                HStack {
                    Text("Open Editorial Reader")
                        .font(.subheadline.weight(.medium))
                    Image(systemName: "arrow.up.right")
                }
                .padding(.vertical, 12)
                .padding(.horizontal, 20)
                .background(theme.primaryText.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(.top, 8)
        }
        .padding(28)
    }
}

struct ReaderSheetView: View {
    let article: Article
    let theme: EyeTheme
    @Environment(\\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text(article.title)
                        .font(.system(size: 28, weight: .bold, design: .serif))
                    ForEach(article.body, id: \\.self) { paragraph in
                        Text(paragraph)
                            .font(.system(size: 18, design: .serif))
                            .lineSpacing(8)
                    }
                }
                .padding(24)
            }
            .background(theme.background)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}`;

export const ANDROID_COMPOSE_CODE = `// FlipStreamActivity.kt — Native Android 15 Jetpack Compose Implementation
// Features: VerticalPager Snap Cards, True Pitch-Black OLED Theme, Blue-Light Filter & RSS Reader

package com.flipstream.reader

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class RssStory(
    val id: String,
    val source: String,
    val category: String,
    val title: String,
    val subtitle: String,
    val readTime: String,
    val paragraphs: List<String>
)

class FlipStreamActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FlipStreamTheme {
                FlipStreamReaderApp()
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun FlipStreamReaderApp() {
    val stories = remember {
        listOf(
            RssStory(
                id = "1",
                source = "Ars Technica",
                category = "Tech",
                title = "Sub-Nanometer Photonic Interconnects Redefine Wafer-Scale Silicon Efficiency",
                subtitle = "Optical waveguides etched directly onto crystalline silicon cut thermal dissipation by 64%.",
                readTime = "5 min read",
                paragraphs = listOf(
                    "During the past decade, the primary bottleneck in high-performance computing has shifted from transistor switching speed to moving electrons across copper.",
                    "A consortium of lithography physicists has unveiled a dual-stage ultraviolet fabrication method integrating silicon nitride waveguides directly into 300mm wafers."
                )
            )
        )
    }

    var amberShield by remember { mutableFloatStateOf(0.18f) }
    var activeReaderStory by remember { mutableStateOf<RssStory?>(null) }
    val pagerState = rememberPagerState(pageCount = { stories.size })

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000)) // Pure Midnight OLED Canvas
    ) {
        VerticalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            val story = stories[page]
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 48.dp),
                verticalArrangement = Arrangement.Bottom
            ) {
                Text(
                    text = "\${story.source} · \${story.category} · \${story.readTime}",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = story.title,
                    color = Color(0xFFF1F5F9),
                    fontSize = 28.sp,
                    lineHeight = 36.sp,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = story.subtitle,
                    color = Color(0xFFCBD5E1),
                    fontSize = 16.sp,
                    lineHeight = 24.sp,
                    fontFamily = FontFamily.Serif
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = { activeReaderStory = story },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF141721),
                        contentColor = Color(0xFFF1F5F9)
                    )
                ) {
                    Text("Read Full Dispatch")
                }
            }
        }

        // Eye-Protective 2700K Amber Blue-Light Shield Overlay
        if (amberShield > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF59E0B).copy(alpha = amberShield * 0.22f))
            )
        }
    }
}

@Composable
fun FlipStreamTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF000000),
            surface = Color(0xFF090A0F),
            onBackground = Color(0xFFF1F5F9),
            onSurface = Color(0xFFCBD5E1)
        ),
        content = content
    )
}`;
