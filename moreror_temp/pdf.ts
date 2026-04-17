import puppeteer from 'puppeteer';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as cheerio from 'cheerio';

// Updated type to match actual API response
export interface PDFGenerationRequest {
  packId?: number;
  projectId: number;
  projectName: string;
  projectType: string;
  description: string;
  email: string;
  template: 'free' | 'paid';
  packData: {
    projectName: string;
    projectType: string;
    description: string;
    projectId: number;
    packId: number;
    email: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    mapboxData?: {
      postcode?: string;
    };
    mapboxMetadata?: Record<string, any>;
    dataSources: {
      google?: {
        success: boolean;
        data?: {
          formattedAddress?: string;
          latitude?: number;
          longitude?: number;
          postcode?: string;
          locality?: string;
          region?: string;
          country?: string;
          nearbyPlaces?: Array<{
            name: string;
            types?: string[];
            rating?: number;
            vicinity?: string;
            location?: {
              lat: number;
              lng: number;
            };
          }>;
        };
        aiSummary?: {
          content: string;
        };
      };
      'ofcom-broadband'?: {
        success: boolean;
        data?: {
          postcode?: string;
          maxPredictedDown?: number;
          maxPredictedUp?: number;
          maxUfbbPredictedDown?: number;
          maxUfbbPredictedUp?: number;
        };
        aiSummary?: {
          content: string;
        };
      };
      'ofcom-mobile'?: {
        success: boolean;
        data?: {
          postcode?: string;
          eeCoverage?: number;
          threeCoverage?: number;
          o2Coverage?: number;
          vodafoneCoverage?: number;
          networkOperators?: Array<string>;
        };
        aiSummary?: {
          content: string;
        };
      };
      'bgs-geology'?: {
        success: boolean;
        data?: {
          bedrockFormation?: string;
          bedrockAge?: string;
          bedrockMinAge?: string;
          superficialType?: string;
          superficialOrigin?: string;
          superficialAge?: string;
          soilDescription?: string;
          soilParentMaterial?: string;
          soilGroup?: string;
          soilDepth?: string;
          soilTexture?: string;
        };
        aiSummary?: {
          content: string;
        };
      };
      flood?: {
        success: boolean;
        data?: {
          floodZone?: string;
          floodRiskLevel?: string;
        };
        aiSummary?: {
          content: string;
        };
      };
      heritage?: {
        success: boolean;
        data?: {
          totalAssetsFound?: number;
          listedBuildingsCount?: number;
          registeredParksGardensCount?: number;
          searchRadius?: number;
          heritageAssets?: Array<{
            name: string;
            type: string;
            grade?: string;
            distance: number;
          }>;
        };
        aiSummary?: {
          content: string;
        };
      };
      'ecological-receptors'?: {
        success: boolean;
        data?: {
          searchRadiusM?: number;
          totalDesignationsFound?: number;
          designationsSummary?: string | null;
          proximitySummary?: string | null;
          nearestDesignationName?: string | null;
          nearestDesignationType?: string | null;
          nearestDesignationDistanceM?: number | null;
          sssiFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          ramsarFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          nationalParkFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          aonbFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          sacFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          spaFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
          localNatureReserveFeatures?: Array<{ name: string; designationType?: string; distanceM: number }>;
        };
        aiSummary?: {
          content: string;
        };
      };
      'water-courses'?: {
        success: boolean;
        data?: {
          searchRadiusM?: number;
          totalWatercoursesFound?: number;
          namedWatercoursesCount?: number;
          riverCount?: number;
          streamCount?: number;
          canalCount?: number;
          drainCount?: number;
          watercoursesSummary?: string | null;
          typesSummary?: string | null;
          nearestWatercourseName?: string | null;
          nearestWatercourseType?: string | null;
          nearestWatercourseDistanceM?: number | null;
          siteIntersectsWatercourse?: boolean;
          riverFeatures?: Array<{
            name: string;
            type?: string;
            waterwayType?: string;
            distanceM?: number;
          }>;
          streamFeatures?: Array<{
            name: string;
            type?: string;
            waterwayType?: string;
            distanceM?: number;
          }>;
          canalFeatures?: Array<{
            name: string;
            type?: string;
            waterwayType?: string;
            distanceM?: number;
          }>;
          drainFeatures?: Array<{
            name: string;
            type?: string;
            waterwayType?: string;
            distanceM?: number;
          }>;
          rawResponseData?: { source?: string; fetchedCount?: number } | null;
        };
        aiSummary?: {
          content: string;
        };
      };
      'contaminated-land'?: {
        success: boolean;
        data?: {
          searchRadiusM?: number;
          totalSitesFound?: number;
          activeSitesCount?: number;
          closedSitesCount?: number;
          restoredSitesCount?: number;
          unknownStatusCount?: number;
          landfillsSummary?: string | null;
          statusSummary?: string | null;
          wasteTypeSummary?: string | null;
          nearestSiteName?: string | null;
          nearestSiteStatus?: string | null;
          nearestSiteDistanceM?: number | null;
          siteWithinLandfill?: boolean;
          landfillFeatures?: Array<{
            siteId?: string;
            siteName?: string;
            status?: string;
            wasteType?: string | null;
            distanceM?: number;
            lat?: number;
            lon?: number;
          }>;
          rawResponseData?: { source?: string; fetchedCount?: number } | null;
        };
        aiSummary?: {
          content: string;
        };
      };
      'pollution-risk'?: {
        success: boolean;
        data?: {
          searchRadiusM?: number;
          totalSitesFound?: number;
          installationCount?: number;
          wasteCount?: number;
          dischargeCount?: number;
          radioactiveCount?: number;
          otherCount?: number;
          sitesSummary?: string | null;
          activitiesSummary?: string | null;
          operatorsSummary?: string | null;
          nearestSiteName?: string | null;
          nearestSiteType?: string | null;
          nearestSiteDistanceM?: number | null;
          nearestSiteOperator?: string | null;
          regulatedFeatures?: Array<{
            siteName?: string;
            registrationNumber?: string;
            permitType?: string;
            operator?: string | null;
            distanceM?: number;
            postcode?: string | null;
            activityDescription?: string | null;
          }>;
          rawResponseData?: { source?: string } | null;
        };
        aiSummary?: {
          content: string;
        };
      };
    };
    packTier?: string;
    packType?: string;
    generatedAt: string;
  };
  generatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Directory layout
//   templates/pdf/
//     styles.css
//     cover.png  (shared images)
//     starter/
//       1-cover.html
//       2-info.html
//       3-toc.html
//       4-project-details.html   (sections 4-N added in next batches)
//       …
//     premium/
//       1-cover.html
//       2-info.html
//       3-toc.html
//       4-project-details.html
//       …
// ─────────────────────────────────────────────────────────────
const TEMPLATES_DIR = join(process.cwd(), 'templates', 'pdf');

// Ordered list of section file names for each tier.
// The service reads each file, checks whether its data guard passes,
// then stitches the page bodies together with page-break divs.
// Pages 1-3 are always included (cover, info, toc).
// Pages 4-N are data-guarded and added only when data exists.

interface SectionDef {
  file: string;                                          // relative to tier sub-folder
  /** Return true when this section should be rendered */
  hasData: (req: PDFGenerationRequest) => boolean;
  /** Number of PDF pages this section occupies (default 1) */
  pages?: number;
}

const STARTER_SECTIONS: SectionDef[] = [
  { file: '1-cover.html',           hasData: () => true },
  { file: '2-info.html',            hasData: () => true },
  { file: '3-toc.html',             hasData: () => true },
  { file: '4-project-details.html', hasData: () => true },
  {
    file: '5-site-location.html',
    hasData: (r) => !!(r.packData.dataSources.google?.success && r.packData.dataSources.google?.data),
  },
  {
    file: '6-adjacent-land-use.html',
    hasData: (r) => !!(r.packData.dataSources.google?.success && r.packData.dataSources.google?.data?.nearbyPlaces?.length),
  },
  {
    file: '7-mobile-coverage.html',
    hasData: (r) => !!(r.packData.dataSources['ofcom-mobile']?.success && r.packData.dataSources['ofcom-mobile']?.data),
  },
  {
    file: '8-broadband-coverage.html',
    hasData: (r) => !!(r.packData.dataSources['ofcom-broadband']?.success && r.packData.dataSources['ofcom-broadband']?.data),
  },
  {
    file: '9-heritage-assets.html',
    hasData: (r) => !!(r.packData.dataSources.heritage?.success && r.packData.dataSources.heritage?.data),
  },
  {
    file: '10-ecological-receptors.html',
    hasData: (r) => !!(r.packData.dataSources['ecological-receptors']?.success && r.packData.dataSources['ecological-receptors']?.data),
  },
  {
    file: '11-geology-soils.html',
    hasData: (r) => !!(r.packData.dataSources['bgs-geology']?.success && r.packData.dataSources['bgs-geology']?.data),
  },
  {
    file: '12-flood-potential.html',
    hasData: (r) => !!(r.packData.dataSources.flood?.success && r.packData.dataSources.flood?.data),
  },
  { file: '13-data-quality.html',   hasData: () => true },
  { file: '14-upsell.html',         hasData: () => true },
];

const PREMIUM_SECTIONS: SectionDef[] = [
  { file: '1-cover.html',             hasData: () => true },
  { file: '2-info.html',              hasData: () => true },
  { file: '3-toc.html',               hasData: () => true },
  { file: '4-project-details.html',   hasData: () => true },
  {
    file: '5-risk-register.html',
    hasData: (r) => !!(r.packData.dataSources as any)['risk-register']?.success,
  },
  {
    file: '6-programme-risk-1.html',
    hasData: (r) => !!(r.packData.dataSources as any)['programme-risk']?.success,
    pages: 2,   // spans 2 PDF pages
  },
  {
    file: '8-site-location.html',
    hasData: (r) => !!(r.packData.dataSources.google?.success && r.packData.dataSources.google?.data),
  },
  {
    file: '9-adjacent-land-use.html',
    hasData: (r) => !!(r.packData.dataSources.google?.success && r.packData.dataSources.google?.data?.nearbyPlaces?.length),
  },
  {
    file: '10-heritage-assets.html',
    hasData: (r) => !!(r.packData.dataSources.heritage?.success && r.packData.dataSources.heritage?.data),
  },
  {
    file: '11-geology-soils.html',
    hasData: (r) => !!(r.packData.dataSources['bgs-geology']?.success && r.packData.dataSources['bgs-geology']?.data),
  },
  {
    file: '12-flood-potential.html',
    hasData: (r) => !!(r.packData.dataSources.flood?.success && r.packData.dataSources.flood?.data),
  },
  {
    file: '13-ecological-receptors.html',
    hasData: (r) => !!(r.packData.dataSources['ecological-receptors']?.success && r.packData.dataSources['ecological-receptors']?.data),
  },
  {
    file: '14-water-courses.html',
    hasData: (r) => !!(r.packData.dataSources['water-courses']?.success && r.packData.dataSources['water-courses']?.data),
  },
  {
    file: '15-mining-records.html',
    hasData: (r) => !!(r.packData.dataSources as any)['mining-records']?.success,
  },
  {
    file: '16-contaminated-land.html',
    hasData: (r) => !!(r.packData.dataSources['contaminated-land']?.success && r.packData.dataSources['contaminated-land']?.data),
  },
  {
    file: '17-pollution-regulatory.html',
    hasData: (r) => !!(r.packData.dataSources['pollution-risk']?.success && r.packData.dataSources['pollution-risk']?.data),
  },
  {
    file: '18-mobile-coverage.html',
    hasData: (r) => !!(r.packData.dataSources['ofcom-mobile']?.success && r.packData.dataSources['ofcom-mobile']?.data),
  },
  {
    file: '19-broadband-coverage.html',
    hasData: (r) => !!(r.packData.dataSources['ofcom-broadband']?.success && r.packData.dataSources['ofcom-broadband']?.data),
  },
  { file: '20-data-quality.html',     hasData: () => true },
  { file: '21-upsell.html',           hasData: () => true },
];

// ─────────────────────────────────────────────────────────────
// Caches
// ─────────────────────────────────────────────────────────────
const templateCache: Map<string, string> = new Map();
let cssCache: string | null = null;
const imageCache: Map<string, string> = new Map();

async function launchBrowser() {
  console.log('🚀 Launching browser...');
  
  const config: any = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const browser = await puppeteer.launch(config);
    const version = await browser.version();
    console.log('✅ Browser launched:', version);
    return browser;
  } catch (error: any) {
    console.error('❌ Browser launch failed:', error.message);
    if (config.executablePath) {
      console.log('🔄 Retrying with bundled Chromium...');
      delete config.executablePath;
      return await puppeteer.launch(config);
    }
    throw error;
  }
}

export async function generatePackPDF(request: PDFGenerationRequest): Promise<Buffer> {
  console.log("🚀 Starting PDF generation:", {
    packId: request.packId,
    projectId: request.projectId,
    template: request.template,
  });

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    const htmlContent = await generatePDFHTML(request);
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      displayHeaderFooter: false,
    });

    console.log("✅ PDF generated successfully");
    return Buffer.from(pdfBuffer);

  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────
// HTML assembly
// ─────────────────────────────────────────────────────────────

async function generatePDFHTML(request: PDFGenerationRequest): Promise<string> {
  console.log('📄 Assembling HTML from per-section templates...');

  const tierFolder   = request.template === 'paid' ? 'premium' : 'starter';
  const sectionDefs  = request.template === 'paid' ? PREMIUM_SECTIONS : STARTER_SECTIONS;
  const tierDir      = join(TEMPLATES_DIR, tierFolder);

  // Load CSS once
  if (!cssCache) {
    cssCache = await readFile(join(TEMPLATES_DIR, 'styles.css'), 'utf-8');
  }

  // Load shared images once
  const images = [
    'cover.png', '02.png', 'ee.png', 'voda.png', '3.png',
    'data/google-maps.png', 'data/ordance-survey.png', 'data/ofcom.png',
    'data/historic-england.png', 'data/dept-food.png', 'data/british-geo.png',
    'data/environmental-agency.png',
    'pro/site-location.png', 'pro/flood-water.png', 'pro/heritage-asset.png',
    'pro/soil.png', 'pro/ajacent-land-use.png',
  ];
  for (const img of images) {
    if (!imageCache.has(img)) {
      const base64 = await encodeImageAsBase64(join(TEMPLATES_DIR, img));
      imageCache.set(img, base64);
    }
  }

  // Determine which sections render and compute running page numbers
  interface ActiveSection {
    def: SectionDef;
    startPage: number;   // 1-based page number within the final PDF
  }

  const activeSections: ActiveSection[] = [];
  let runningPage = 1;
  for (const def of sectionDefs) {
    if (def.hasData(request)) {
      activeSections.push({ def, startPage: runningPage });
      runningPage += def.pages ?? 1;
    }
  }
  const totalPages = runningPage - 1;

  console.log(`📑 Rendering ${activeSections.length} sections (${totalPages} pages total)`);

  // Load and process each active section
  const bodyChunks: string[] = [];

  for (const { def, startPage } of activeSections) {
    const cacheKey = `${tierFolder}/${def.file}`;
    let sectionHtml = templateCache.get(cacheKey);
    if (!sectionHtml) {
      sectionHtml = await readFile(join(tierDir, def.file), 'utf-8');
      templateCache.set(cacheKey, sectionHtml);
    }

    const $ = cheerio.load(sectionHtml);

    // Inline images
    for (const [filename, base64] of imageCache.entries()) {
      $(`img[src="${filename}"]`).attr('src', base64);
      $(`img[src="../${filename}"]`).attr('src', base64);
    }

    // Populate data for this specific section
    populateSectionData($, def.file, request, startPage, totalPages);

    // Extract only the <body> inner HTML so sections stitch cleanly
    const bodyHtml = $('body').html() || '';
    bodyChunks.push(bodyHtml);
  }

  // Build the full combined document
  const combinedBody = bodyChunks.join('\n    <!-- PAGE BREAK -->\n    <div class="page-break"></div>\n\n    ');

  const fullHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sofia+Sans+Condensed:ital,wght@0,1..1000;1,1..1000&display=swap"
      rel="stylesheet"
    />
    <style>${cssCache}</style>
  </head>
  <body>
    ${combinedBody}
  </body>
</html>`;

  return fullHtml;
}

// ─────────────────────────────────────────────────────────────
// Per-section data population dispatcher
// ─────────────────────────────────────────────────────────────

function populateSectionData(
  $: cheerio.CheerioAPI,
  file: string,
  request: PDFGenerationRequest,
  startPage: number,
  totalPages: number,
): void {
  const packData    = request.packData;
  const email       = request.email || packData.email;
  const generatedAt = request.generatedAt || packData.generatedAt;
  const projectName = packData.projectName || request.projectName || 'Project';
  const isPremium   = request.template === 'paid';

  const preparedOn = new Date(generatedAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Shared footer update
  const updateFooter = (label: string, page: number) => {
    $('.footer-left').each((_i, elem) => {
      const $el = $(elem);
      const text = $el.text();
      if (text.includes('PROJECT NAME')) {
        $el.text(text.replace('PROJECT NAME', projectName.toUpperCase()));
      }
    });
    $('.page-num').each((_i, elem) => {
      const pageStr = String(page).padStart(2, '0');
      const totalStr = String(totalPages).padStart(2, '0');
      $(elem).html(`<b>${pageStr}</b> of ${totalStr}`);
    });
  };

  // ── Section dispatchers ────────────────────────────────────

  if (file.includes('1-cover')) {
    // ========================================
    // 1. COVER PAGE
    // ========================================
    $('#prepared-on').text(preparedOn);
    $('#commissioned-by').text(email);
    $('#prepared-for').text(`${projectName}, ${packData.address || ''}`);
    return;
  }

  if (file.includes('2-info')) {
    // Info page — static marketing content, no data to inject
    return;
  }

  if (file.includes('3-toc')) {
    // ========================================
    // 3. TABLE OF CONTENTS — dynamic injection
    // ========================================
    // Re-derive active sections without the first 3 fixed pages
    const sectionDefs  = isPremium ? PREMIUM_SECTIONS : STARTER_SECTIONS;
    const tocEntries: Array<{ label: string; page: number }> = [];
    let pg = 1;
    for (const def of sectionDefs) {
      const active = def.hasData(request);
      if (active) {
        const label = tocLabelForFile(def.file);
        if (label && pg > 3) {   // skip cover/info/toc themselves
          tocEntries.push({ label, page: pg });
        }
        pg += def.pages ?? 1;
      }
    }

    const listHtml = tocEntries
      .map(
        (e) =>
          `<li><span>${e.label}</span> <span>${String(e.page).padStart(2, '0')}</span></li>`,
      )
      .join('\n        ');

    $('#toc-list').html(listHtml);
    return;
  }

  if (file.includes('4-project-details')) {
    // ========================================
    // 4. PROJECT DETAILS / SUMMARY
    // ========================================
    $('#project-reference').text(`Project #${request.projectId} - ${projectName}`);
    $('#description-short').text(request.description);
    $('#description-long').text(request.description);
    updateFooter('PROJECT SUMMARY', startPage);
    return;
  }

  if (file.includes('site-location')) {
    // ========================================
    // SITE LOCATION INFO
    // ========================================
    const googleData = packData.dataSources.google?.data;
    const postcode   = googleData?.postcode || packData.mapboxData?.postcode || 'N/A';

    if (googleData) {
      $('#location-address').text(googleData.formattedAddress || packData.address);
      $('#location-coordinates').text(
        `${packData.coordinates.lat.toFixed(6)}, ${packData.coordinates.lng.toFixed(6)}`,
      );
      $('#site-postcode').text(postcode);
      $('#site-locality').text(googleData.locality || 'N/A');
      $('#site-region').text(googleData.region || 'N/A');
      $('#site-country').text(googleData.country || 'N/A');
    } else {
      $('#location-address').text(packData.address);
      $('#location-coordinates').text(
        `${packData.coordinates.lat.toFixed(6)}, ${packData.coordinates.lng.toFixed(6)}`,
      );
      $('#site-postcode').text(postcode);
    }

    if (packData.dataSources.google?.aiSummary?.content) {
      try {
        const cleanJson = packData.dataSources.google.aiSummary.content
          .replace(/```json\n?|\n?```/g, '')
          .trim();
        const summary = JSON.parse(cleanJson);
        $('#site-access').text(summary.Access || '');
        $('#site-constraints').text(summary.Constraints || '');
        $('#site-considerations').text(summary.Considerations || '');
        $('#site-mitigations').text(summary.Mitigations || '');
        console.log('✅ Site location AI summary populated');
      } catch (error) {
        console.warn('⚠️ Could not parse site location AI summary:', error);
      }
    }

    updateFooter('SITE LOCATION INFORMATION', startPage);
    return;
  }

  if (file.includes('adjacent-land-use')) {
    // ========================================
    // ADJACENT LAND USE
    // ========================================
    const googleData = packData.dataSources.google?.data;
    if (packData.dataSources.google?.success && googleData?.nearbyPlaces) {
      const places = googleData.nearbyPlaces.slice(0, 10);
      let placesHtml = '';
      places.forEach((place) => {
        if (!place.name || place.name === 'London' || place.name.toLowerCase().includes('soho')) return;
        let distance = 'N/A';
        if (place.location && packData.coordinates) {
          const dist = calculateDistance(
            packData.coordinates.lat, packData.coordinates.lng,
            place.location.lat, place.location.lng,
          );
          distance = Math.round(dist) + 'm';
        }
        const placeType = place.types?.[0]?.replace(/_/g, ' ') || 'N/A';
        const rating    = place.rating ? `${place.rating}/5` : 'No rating';
        placesHtml += `
          <div class="adjacent-info-row">
            <div class="adjacent-info-label">${escapeHtml(place.name)}</div>
            <div class="adjacent-info-content">
              <b>Type:</b> ${escapeHtml(placeType)}<br>
              <b>Distance:</b> ${distance}<br>
              ${place.rating ? `<b>Rating:</b> ${rating}<br>` : ''}
              ${place.vicinity ? `<b>Location:</b> ${escapeHtml(place.vicinity)}<br>` : ''}
            </div>
          </div>`;
      });
      $('#google-places-container').html(placesHtml);
      console.log('✅ Adjacent land use / Google Places data populated');
    }
    updateFooter('ADJACENT LAND USE', startPage);
    return;
  }

  if (file.includes('mobile-coverage')) {
    // ========================================
    // MOBILE COVERAGE
    // ========================================
    const mobileData = packData.dataSources['ofcom-mobile']?.data;
    if (mobileData) {
      const level = 4;
      const networkOperators = mobileData.networkOperators;
      if (networkOperators?.length) {
        networkOperators.forEach((network_ava) => {
          network_ava = network_ava.toLowerCase();
          const ntCoverage = (mobileData as any)[`${network_ava}Coverage`] as number | undefined;
          const ntk_selector = `signal_${network_ava}`;
          $(`.${ntk_selector}`).css('display', 'flex');
          $(`#${ntk_selector}`).html('');
          for (let i = 0; i < level; i++) {
            $(`#${ntk_selector}`).append(
              i < (ntCoverage || 0)
                ? '<div class="bar active"></div>'
                : '<div class="bar"></div>',
            );
          }
        });
      }
      const mobileAiSummary = getAiSummary(packData.dataSources['ofcom-mobile']?.aiSummary);
      if (mobileAiSummary) {
        $('#mobile-connectivity').html(mobileAiSummary.Coverage || '');
        $('#mobile-performance').html(mobileAiSummary.Performance || '');
        $('#mobile-considerations').html(mobileAiSummary.Considerations || '');
        $('#mobile-mitigations').html(mobileAiSummary.Mitigations || '');
      }
      console.log('✅ Mobile coverage data populated');
    }
    updateFooter('CONNECTION COVERAGE', startPage);
    return;
  }

  if (file.includes('broadband-coverage')) {
    // ========================================
    // BROADBAND COVERAGE
    // ========================================
    const broadbandData = packData.dataSources['ofcom-broadband']?.data;
    if (broadbandData) {
      $('#broadband-postcode').text(broadbandData.postcode || 'N/A');
      $('#broadband-max-download').text(
        broadbandData.maxPredictedDown ? `${broadbandData.maxPredictedDown} Mbps` : 'N/A',
      );
      $('#broadband-max-upload').text(
        broadbandData.maxPredictedUp ? `${broadbandData.maxPredictedUp} Mbps` : 'N/A',
      );
      $('#broadband-ufbb').text(
        broadbandData.maxUfbbPredictedDown && broadbandData.maxUfbbPredictedDown > 0
          ? 'Available'
          : 'Not Available',
      );

      const networkTypes = ['BbPredictedDown', 'SfbbPredictedDown', 'UfbbPredictedDown', 'PredictedDown'];
      networkTypes.forEach((network_ava) => {
        const ntCoverage = (broadbandData as any)[`max${network_ava}`] as number | undefined;
        const ntk_selector = `signal_${network_ava}`;
        if (ntCoverage !== undefined && $(`.${ntk_selector}`).length && ntCoverage > 0) {
          $(`.${ntk_selector}`).css('display', 'flex');
          $(`.${ntk_selector} svg`).html('');
          let speed_value = 0;
          if (ntCoverage <= 20)                         speed_value = 0;
          else if (ntCoverage > 20 && ntCoverage <= 300) speed_value = 1;
          else if (ntCoverage > 300 && ntCoverage <= 1000) speed_value = 2;
          else if (ntCoverage > 1000)                   speed_value = 3;
          $(`.${ntk_selector} svg`).append(broadbandSignal(speed_value));
          $(`#speed-${network_ava}`).html(`${ntCoverage}mb/s`);
        }
      });

      const broadbandAiSummary = getAiSummary(packData.dataSources['ofcom-broadband']?.aiSummary);
      if (broadbandAiSummary && broadbandAiSummary.length) {
        $('#broadband-connectivity').html(broadbandAiSummary.Coverage || '');
        $('#broadband-performance').html(broadbandAiSummary.Performance || '');
      }
      console.log('✅ Broadband coverage data populated');
    }
    updateFooter('CONNECTION COVERAGE', startPage);
    return;
  }

  if (file.includes('heritage-assets')) {
    // ========================================
    // HERITAGE ASSETS
    // ========================================
    const heritageData = packData.dataSources.heritage?.data;
    if (packData.dataSources.heritage?.aiSummary?.content) {
      const summary = getAiSummary(packData.dataSources.heritage?.aiSummary);
      const suffix = '_adjacent-info-label';
      $(`#context${suffix}`).html(summary.Assets || '');
      $(`#considerations${suffix}`).html(summary.Considerations || '');
      $(`#mitigations${suffix}`).html(summary.Mitigations || '');
      const hs = '_heritage_info';
      $(`#access${hs}`).html(summary.Assets || '');
      $(`#constraints${hs}`).html(summary.Considerations || '');
      $(`#considerations${hs}`).html(summary.Mitigations || '');
      $(`#mitigations${hs}`).html(summary.Mitigations || '');
    }
    if (heritageData) {
      const summaryText = heritageData.totalAssetsFound !== undefined
        ? `${heritageData.totalAssetsFound} heritage assets found within ${heritageData.searchRadius || 50}m radius`
        : 'No data available';
      $('#heritage-summary').text(summaryText);
      const assets = heritageData.heritageAssets;
      if (assets && assets.length > 0) {
        const grouped = assets.reduce((acc: Record<string, typeof assets>, asset) => {
          if (!acc[asset.type]) acc[asset.type] = [];
          acc[asset.type].push(asset);
          return acc;
        }, {} as Record<string, typeof assets>);
        let heritageHtml = '';
        Object.keys(grouped).forEach((type) => {
          heritageHtml += `<li><b>${escapeHtml(type)}:</b> `;
          heritageHtml += grouped[type]
            .map((a) => `${escapeHtml(a.name)} (Grade ${escapeHtml(a.grade || 'N/A')}) – ${a.distance}m away`)
            .join('; ');
          heritageHtml += '</li>';
        });
        $('#heritage-container').html(heritageHtml);
      }
      if (heritageData.listedBuildingsCount && heritageData.listedBuildingsCount > 0 && heritageData.heritageAssets) {
        const listedBuildings = heritageData.heritageAssets
          .filter((a) => a.type === 'Listed Buildings')
          .slice(0, 5)
          .map((b) => `<b>${escapeHtml(b.name)}</b> - Grade ${escapeHtml(b.grade || 'N/A')} (${b.distance}m)`)
          .join('<br>');
        if (listedBuildings) $('#heritage-buildings').html(listedBuildings);
      }
      if (heritageData.registeredParksGardensCount && heritageData.registeredParksGardensCount > 0) {
        $('#heritage-parks').text(
          `${heritageData.registeredParksGardensCount} registered park(s) and garden(s) nearby`,
        );
      }
      console.log('✅ Heritage assets data populated');
    }
    updateFooter('HERITAGE ASSETS', startPage);
    return;
  }

  if (file.includes('ecological-receptors')) {
    // ========================================
    // ECOLOGICAL RECEPTORS
    // ========================================
    const ecologicalSource = packData.dataSources['ecological-receptors'];
    const ecologicalReceptorsData = ecologicalSource?.data;
    if (ecologicalSource?.success && ecologicalReceptorsData) {
      const radiusM = ecologicalReceptorsData.searchRadiusM ?? 1000;
      const total   = ecologicalReceptorsData.totalDesignationsFound ?? 0;
      $('#ecological-receptors-stats').text(
        total > 0
          ? `${total} designation(s) found within ${Math.round(radiusM)}m search radius.`
          : `No statutory ecological designations returned within ${Math.round(radiusM)}m (England-only layers).`,
      );
      const nearestName = ecologicalReceptorsData.nearestDesignationName;
      if (nearestName) {
        const dist = ecologicalReceptorsData.nearestDesignationDistanceM;
        const type = ecologicalReceptorsData.nearestDesignationType ?? '';
        const distText = dist != null && !Number.isNaN(dist) ? ` — ${Math.round(dist)}m` : '';
        $('#ecological-receptors-nearest').text(
          `Nearest: ${nearestName}${type ? ` (${type})` : ''}${distText}`,
        );
      } else {
        $('#ecological-receptors-nearest').text('');
      }
      const featureRows: Array<{ key: keyof NonNullable<typeof ecologicalReceptorsData>; label: string }> = [
        { key: 'sssiFeatures', label: 'SSSI' },
        { key: 'ramsarFeatures', label: 'Ramsar' },
        { key: 'nationalParkFeatures', label: 'National Park' },
        { key: 'aonbFeatures', label: 'AONB' },
        { key: 'sacFeatures', label: 'SAC' },
        { key: 'spaFeatures', label: 'SPA' },
        { key: 'localNatureReserveFeatures', label: 'Local Nature Reserve' },
      ];
      let featuresHtml = '';
      for (const { key, label } of featureRows) {
        const feats = ecologicalReceptorsData[key] as Array<{ name: string; distanceM: number }> | undefined;
        if (feats?.length) {
          const line = feats.slice(0, 8).map((f) => `${escapeHtml(f.name)} (${Math.round(f.distanceM ?? 0)}m)`).join('; ');
          featuresHtml += `<li><b>${escapeHtml(label)}:</b> ${line}</li>`;
        }
      }
      $('#ecological-receptors-features').html(
        featuresHtml || '<li style="list-style: none; margin-left: -18pt">No designation polygons in this search area.</li>',
      );
      const ecoAi   = ecologicalSource.aiSummary;
      const aiParsed = ecoAi ? getAiSummary(ecoAi) : undefined;
      const hasAi   = aiParsed && typeof aiParsed === 'object' && (aiParsed.Receptors || aiParsed.Constraints || aiParsed.Considerations || aiParsed.Mitigations);
      if (hasAi) {
        $('#ecological-receptors-access').html((aiParsed.Receptors as string) || ecologicalReceptorsData.designationsSummary || '');
        $('#ecological-receptors-constraints').html((aiParsed.Constraints as string) || '');
        $('#ecological-receptors-considerations').html((aiParsed.Considerations as string) || '');
        $('#ecological-receptors-mitigations').html((aiParsed.Mitigations as string) || '');
      } else {
        $('#ecological-receptors-access').html(
          ecologicalReceptorsData.designationsSummary ? escapeHtml(ecologicalReceptorsData.designationsSummary) : '',
        );
        $('#ecological-receptors-constraints').text(ecologicalReceptorsData.proximitySummary || '');
        $('#ecological-receptors-considerations').text('');
        $('#ecological-receptors-mitigations').text('');
      }
      console.log('✅ Ecological receptors data populated');
    }
    updateFooter('ECOLOGICAL RECEPTORS', startPage);
    return;
  }

  if (file.includes('geology-soils')) {
    // ========================================
    // GEOLOGY & SOILS
    // ========================================
    const geologyData = packData.dataSources['bgs-geology']?.data;
    if (geologyData) {
      $('#bedrock_formation').html(geologyData.bedrockFormation || '');
      $('#rock_type').html(geologyData.bedrockMinAge || '');
      $('#rock_age').html(geologyData.bedrockAge || '');
      $('#superficial_type').html(geologyData.superficialType || '');
      $('#superficial_characteristics').html(geologyData.superficialOrigin || '');
      $('#superficial_age').html(geologyData.superficialAge || '');
      $('#soil_parent_material').html(geologyData.soilParentMaterial || '');
      $('#soil_texture').html(geologyData.soilTexture || '');
      $('#soil_depth').html(geologyData.soilDepth || '');
      $('#soil_group').html(geologyData.soilGroup || '');

      const bedrockText    = geologyData.bedrockFormation ? `${geologyData.bedrockFormation} ${geologyData.bedrockAge ? `(${geologyData.bedrockAge})` : ''}` : 'N/A';
      const superficialText = geologyData.superficialType ? `${geologyData.superficialType} ${geologyData.superficialOrigin ? `(${geologyData.superficialOrigin})` : ''}` : 'None detected';
      const soilText        = geologyData.soilDescription ? `${geologyData.soilDescription} - ${geologyData.soilDepth || 'Unknown depth'}, ${geologyData.soilTexture || 'Unknown texture'}` : 'N/A';
      $('#soil_type_summary').html(`${bedrockText} ${superficialText} ${soilText}`);

      const geoSummary = getAiSummary(packData.dataSources['bgs-geology']?.aiSummary);
      if (geoSummary?.Geology) $('#bgs_geology_summary').html(geoSummary.Geology || '');
      console.log('✅ Geology data populated');
    }
    updateFooter('GEOLOGY & SOIL TYPES', startPage);
    return;
  }

  if (file.includes('flood-potential')) {
    // ========================================
    // FLOOD POTENTIAL
    // ========================================
    const floodData = packData.dataSources.flood?.data;
    if (floodData) {
      const summary = getAiSummary(packData.dataSources.flood?.aiSummary);
      if (summary) {
        $('#flooding_summary').html(`${summary.Mitigations}, ${summary.Considerations}`);
        $('#flood-risk').text(summary.Risk || 'Unknown');
        $('#flood-zone').text(floodData.floodZone || 'Unknown');
      }
      console.log('✅ Flood risk data populated');
    }
    updateFooter('FLOODING POTENTIAL', startPage);
    return;
  }

  if (file.includes('water-courses')) {
    // ========================================
    // WATER COURSES (PREMIUM)
    // ========================================
    const waterCoursesSource = packData.dataSources['water-courses'];
    const waterCoursesData   = waterCoursesSource?.data;
    if (waterCoursesSource?.success && waterCoursesData) {
      const radiusM  = waterCoursesData.searchRadiusM ?? 250;
      const lat      = packData.coordinates?.lat;
      const lng      = packData.coordinates?.lng;
      const coordStr = typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'the site pin';
      const apiHint  = waterCoursesData.rawResponseData?.source ? ` Data retrieved via ${waterCoursesData.rawResponseData.source}.` : '';
      $('#water-courses-source-text').text(
        `Inland watercourse features are derived from Ordnance Survey Open Rivers (via OS Data Hub), queried within a ${Math.round(radiusM)} m search radius of the site (${coordStr}).${apiHint} Lines shown are indicative; verify against authoritative mapping and survey where design decisions depend on watercourse position.`,
      );
      const total = waterCoursesData.totalWatercoursesFound ?? 0;
      const named = waterCoursesData.namedWatercoursesCount ?? 0;
      const rc    = waterCoursesData.riverCount ?? 0;
      const sc    = waterCoursesData.streamCount ?? 0;
      const cc    = waterCoursesData.canalCount ?? 0;
      const dc    = waterCoursesData.drainCount ?? 0;
      const breakdown = total > 0 ? ` Breakdown: ${rc} main river(s), ${sc} stream(s), ${cc} canal(s), ${dc} drain/ditch(es).` : '';
      $('#water-courses-stats').text(
        total > 0
          ? `${total} watercourse feature(s) within ${Math.round(radiusM)} m of the site (${named} distinct name(s)).${breakdown}`
          : `No watercourse features returned within ${Math.round(radiusM)} m (Ordnance Survey Open Rivers).`,
      );
      if (waterCoursesData.siteIntersectsWatercourse) {
        $('#water-courses-warning').html('<p style="color: #D65D12; font-weight: 600;">⚠️ The site intersects or lies very close to one or more mapped watercourses. A hydrological assessment and Environment Agency consultation may be appropriate.</p>');
      } else {
        $('#water-courses-warning').html('');
      }
      const nearestName = waterCoursesData.nearestWatercourseName;
      if (nearestName) {
        const dist     = waterCoursesData.nearestWatercourseDistanceM;
        const type     = waterCoursesData.nearestWatercourseType ?? '';
        const distText = dist != null && !Number.isNaN(dist) ? ` — ${Math.round(dist)} m from site pin` : '';
        $('#water-courses-nearest').text(`Nearest mapped watercourse: ${nearestName}${type ? ` (${type})` : ''}${distText}.`);
      } else {
        $('#water-courses-nearest').text('');
      }
      const featureRowsWC: Array<{ key: keyof NonNullable<typeof waterCoursesData>; label: string }> = [
        { key: 'riverFeatures', label: 'Main river' },
        { key: 'streamFeatures', label: 'Stream' },
        { key: 'canalFeatures', label: 'Canal' },
        { key: 'drainFeatures', label: 'Drain / ditch' },
      ];
      const formatWCLine = (f: { name: string; distanceM?: number; type?: string; waterwayType?: string }) => {
        const kind = f.waterwayType || f.type;
        const dist = f.distanceM;
        const distPart = dist != null && !Number.isNaN(dist) ? `${Math.round(dist)} m` : '—';
        return `${escapeHtml(f.name)}${kind ? ` — ${escapeHtml(String(kind))}` : ''} (${distPart})`;
      };
      let wcFeaturesHtml = '';
      for (const { key, label } of featureRowsWC) {
        const feats = waterCoursesData[key] as Array<{ name: string; distanceM?: number; type?: string; waterwayType?: string }> | undefined;
        if (feats?.length) {
          wcFeaturesHtml += `<li><b>${escapeHtml(label)}:</b> ${feats.slice(0, 8).map(formatWCLine).join('; ')}</li>`;
        }
      }
      $('#water-courses-features').html(wcFeaturesHtml || '<li style="list-style: none; margin-left: -18pt">No watercourses in this search area.</li>');
      const waterAi  = waterCoursesSource.aiSummary;
      const wcParsed = waterAi ? getAiSummary(waterAi) : undefined;
      const wcHasAi  = wcParsed && typeof wcParsed === 'object' && (wcParsed.WaterCourses || wcParsed.Considerations || wcParsed.Mitigations);
      if (wcHasAi && wcParsed) {
        const wc = wcParsed as Record<string, unknown>;
        $('#water-courses-summary').html((wc.WaterCourses as string) || waterCoursesData.watercoursesSummary || '');
        $('#water-courses-considerations').html((wc.Considerations as string) || '');
        $('#water-courses-mitigations').html((wc.Mitigations as string) || '');
      } else {
        $('#water-courses-summary').html(waterCoursesData.watercoursesSummary ? escapeHtml(waterCoursesData.watercoursesSummary) : '');
        $('#water-courses-considerations').text(waterCoursesData.typesSummary || '');
        $('#water-courses-mitigations').text('');
      }
      console.log('✅ Water courses data populated');
    }
    updateFooter('WATER COURSES', startPage);
    return;
  }

  if (file.includes('contaminated-land')) {
    // ========================================
    // CONTAMINATED LAND (PREMIUM)
    // ========================================
    const contaminatedSource = packData.dataSources['contaminated-land'];
    const contaminatedData   = contaminatedSource?.data;
    if (contaminatedSource?.success && contaminatedData) {
      const radiusM   = contaminatedData.searchRadiusM ?? 5000;
      const radiusKm  = (radiusM / 1000).toFixed(1);
      const lat       = packData.coordinates?.lat;
      const lng       = packData.coordinates?.lng;
      const coordStr  = typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'the site pin';
      const apiHint   = contaminatedData.rawResponseData?.source ? ` Data retrieved via ${contaminatedData.rawResponseData.source}.` : '';
      $('#contaminated-land-source-text').text(
        `Recorded historic landfill sites are from the Environment Agency Historic Landfill Service, queried within a ${radiusKm} km search radius of the site (${coordStr}).${apiHint} Boundaries and distances are indicative; a Phase 1 Desk Study and ground investigation may be required where development is proposed.`,
      );
      const total = contaminatedData.totalSitesFound ?? 0;
      const ac    = contaminatedData.activeSitesCount ?? 0;
      const cl    = contaminatedData.closedSitesCount ?? 0;
      const rc    = contaminatedData.restoredSitesCount ?? 0;
      const uc    = contaminatedData.unknownStatusCount ?? 0;
      const breakdown = total > 0 ? ` Status breakdown (derived from licence records): ${ac} active, ${cl} closed, ${rc} restored, ${uc} unknown.` : '';
      $('#contaminated-land-stats').text(
        total > 0
          ? `${total} historic landfill site(s) within ${radiusKm} km of the site.${breakdown}`
          : `No historic landfill polygons returned within ${radiusKm} km (Environment Agency Historic Landfill).`,
      );
      if (contaminatedData.siteWithinLandfill) {
        $('#contaminated-land-warning').html('<p style="color: #C0392B; font-weight: 600;">⚠️ The site may lie within or immediately adjacent to a recorded landfill boundary. A Phase 1 Desk Study and Phase 2 Ground Investigation are strongly recommended prior to development.</p>');
      } else {
        $('#contaminated-land-warning').html('');
      }
      const nearestName = contaminatedData.nearestSiteName;
      if (nearestName) {
        const dist     = contaminatedData.nearestSiteDistanceM;
        const st       = contaminatedData.nearestSiteStatus ?? '';
        const distText = dist != null && !Number.isNaN(dist) ? ` — ${Math.round(dist)} m from site pin` : '';
        $('#contaminated-land-nearest').text(`Nearest recorded landfill: ${nearestName}${st ? ` (${st})` : ''}${distText}.`);
      } else {
        $('#contaminated-land-nearest').text('');
      }
      const feats = (contaminatedData.landfillFeatures ?? []) as Array<{ siteName?: string; siteId?: string; status?: string; wasteType?: string | null; distanceM?: number }>;
      let clFeaturesHtml = '';
      for (const f of feats.slice(0, 8)) {
        const name     = f.siteName ?? f.siteId ?? 'Unnamed site';
        const st       = f.status ? String(f.status) : '';
        const dist     = f.distanceM;
        const distPart = dist != null && !Number.isNaN(dist) ? `${Math.round(dist)} m` : '—';
        const waste    = f.wasteType ? ` — ${escapeHtml(String(f.wasteType))}` : '';
        clFeaturesHtml += `<li>${escapeHtml(name)}${st ? ` — ${escapeHtml(st)}` : ''} (${distPart})${waste}</li>`;
      }
      $('#contaminated-land-features').html(clFeaturesHtml || '<li style="list-style: none; margin-left: -18pt">No landfill features listed in this search area.</li>');
      const clAi     = contaminatedSource.aiSummary;
      const clParsed = clAi ? getAiSummary(clAi) : undefined;
      const clHasAi  = clParsed && typeof clParsed === 'object' && (clParsed.Sources || clParsed.Considerations || clParsed.Mitigations);
      if (clHasAi && clParsed) {
        const cl2 = clParsed as Record<string, unknown>;
        $('#contaminated-land-sources').html((cl2.Sources as string) || contaminatedData.landfillsSummary || '');
        $('#contaminated-land-considerations').html((cl2.Considerations as string) || '');
        $('#contaminated-land-mitigations').html((cl2.Mitigations as string) || '');
      } else {
        $('#contaminated-land-sources').html(contaminatedData.landfillsSummary ? escapeHtml(contaminatedData.landfillsSummary) : '');
        $('#contaminated-land-considerations').text(contaminatedData.statusSummary || '');
        $('#contaminated-land-mitigations').text(contaminatedData.wasteTypeSummary || '');
      }
      console.log('✅ Contaminated land data populated');
    }
    updateFooter('CONTAMINATED LAND', startPage);
    return;
  }

  if (file.includes('pollution-regulatory')) {
    // ========================================
    // POLLUTION & REGULATORY (PREMIUM)
    // ========================================
    const pollutionPermitLabel: Record<string, string> = {
      installation: 'Industrial installation (IED/PPC)',
      waste: 'Waste operation',
      discharge: 'Water / groundwater discharge',
      radioactive: 'Radioactive substances',
      other: 'Other permit',
    };
    const pollutionSource = packData.dataSources['pollution-risk'];
    const pollutionData   = pollutionSource?.data;
    if (pollutionSource?.success && pollutionData) {
      const radiusM   = pollutionData.searchRadiusM ?? 5000;
      const radiusKm  = (radiusM / 1000).toFixed(1);
      const lat       = packData.coordinates?.lat;
      const lng       = packData.coordinates?.lng;
      const coordStr  = typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'the site pin';
      const apiHint   = pollutionData.rawResponseData?.source ? ` Data retrieved via ${pollutionData.rawResponseData.source}.` : '';
      $('#pollution-risk-source-text').text(
        `Regulated environmental permit sites are queried from the Environment Agency Public Register (spatial search in British National Grid), within a ${radiusKm} km radius of the site (${coordStr}).${apiHint} Results are indicative; verify permit status and conditions with the Environment Agency for design or enforcement decisions.`,
      );
      const total    = pollutionData.totalSitesFound ?? 0;
      const ins      = pollutionData.installationCount ?? 0;
      const wa       = pollutionData.wasteCount ?? 0;
      const di       = pollutionData.dischargeCount ?? 0;
      const ra       = pollutionData.radioactiveCount ?? 0;
      const ot       = pollutionData.otherCount ?? 0;
      const breakdown = total > 0 ? ` By permit type: ${ins} installation(s), ${wa} waste, ${di} discharge(s), ${ra} radioactive, ${ot} other.` : '';
      $('#pollution-risk-stats').text(
        total > 0
          ? `${total} regulated site(s) within ${radiusKm} km of the site.${breakdown}`
          : `No regulated permit records returned within ${radiusKm} km (Environment Agency Public Register).`,
      );
      if ((pollutionData.installationCount ?? 0) > 0) {
        $('#pollution-risk-warning').html('<p style="color: #8B0000; font-weight: 600;">⚠️ One or more IED/PPC industrial installations are recorded near this site. Review permit conditions and consult the Environment Agency where development may interact with regulated activities.</p>');
      } else {
        $('#pollution-risk-warning').html('');
      }
      const pn = pollutionData.nearestSiteName;
      if (pn) {
        const dist  = pollutionData.nearestSiteDistanceM;
        const ptype = pollutionData.nearestSiteType ? (pollutionPermitLabel[pollutionData.nearestSiteType] ?? pollutionData.nearestSiteType) : '';
        const op    = pollutionData.nearestSiteOperator;
        const distText = dist != null && !Number.isNaN(dist) ? ` — ${Math.round(dist)} m from site pin` : '';
        const opText   = op ? ` — operator: ${op}` : '';
        $('#pollution-risk-nearest').text(`Nearest regulated site: ${pn}${ptype ? ` (${ptype})` : ''}${distText}${opText}.`);
      } else {
        $('#pollution-risk-nearest').text('');
      }
      const regFeats     = (pollutionData.regulatedFeatures ?? []) as Array<{ siteName?: string; registrationNumber?: string; permitType?: string; operator?: string | null; distanceM?: number; postcode?: string | null }>;
      let prFeaturesHtml = '';
      for (const f of regFeats.slice(0, 8)) {
        const name     = f.siteName ?? f.registrationNumber ?? 'Unknown site';
        const pt       = f.permitType ? (pollutionPermitLabel[f.permitType] ?? f.permitType) : '';
        const dist     = f.distanceM;
        const distPart = dist != null && !Number.isNaN(dist) ? `${Math.round(dist)} m` : '—';
        const op       = f.operator ? ` — ${escapeHtml(String(f.operator))}` : '';
        const pc       = f.postcode ? ` — ${escapeHtml(String(f.postcode))}` : '';
        prFeaturesHtml += `<li>${escapeHtml(name)}${pt ? ` — ${escapeHtml(pt)}` : ''} (${distPart})${op}${pc}</li>`;
      }
      $('#pollution-risk-features').html(prFeaturesHtml || '<li style="list-style: none; margin-left: -18pt">No regulated sites listed in this search area.</li>');
      const prAi     = pollutionSource.aiSummary;
      const prParsed = prAi ? getAiSummary(prAi) : undefined;
      const prHasAi  = prParsed && typeof prParsed === 'object' && (prParsed.Context || prParsed.Considerations || prParsed.Mitigations);
      if (prHasAi && prParsed) {
        const pr = prParsed as Record<string, unknown>;
        $('#pollution-risk-context').html((pr.Context as string) || pollutionData.sitesSummary || '');
        $('#pollution-risk-considerations').html((pr.Considerations as string) || '');
        $('#pollution-risk-mitigations').html((pr.Mitigations as string) || '');
      } else {
        $('#pollution-risk-context').html(pollutionData.sitesSummary ? escapeHtml(pollutionData.sitesSummary) : '');
        $('#pollution-risk-considerations').text(pollutionData.activitiesSummary || '');
        $('#pollution-risk-mitigations').text(pollutionData.operatorsSummary || '');
      }
      console.log('✅ Pollution & regulatory data populated');
    }
    updateFooter('POLLUTION & REGULATORY', startPage);
    return;
  }

  // data-quality and upsell have no dynamic data — footer update only
  if (file.includes('data-quality')) {
    updateFooter('DATA QUALITY', startPage);
  }
}

// ─────────────────────────────────────────────────────────────
// TOC label map
// ─────────────────────────────────────────────────────────────
function tocLabelForFile(file: string): string {
  const map: Record<string, string> = {
    '4-project-details':    'Project Summary',
    '5-risk-register':      'Risk Register',
    '6-programme-risk-1':   'Programme Risk Analysis',
    '5-site-location':      'Site Location & Access',
    '8-site-location':      'Site Location & Access',
    '6-adjacent-land-use':  'Adjacent Land Use',
    '9-adjacent-land-use':  'Adjacent Land Use',
    '7-mobile-coverage':    'Mobile Coverage',
    '18-mobile-coverage':   'Mobile Coverage',
    '8-broadband-coverage': 'Broadband Coverage',
    '19-broadband-coverage':'Broadband Coverage',
    '9-heritage-assets':    'Heritage Assets',
    '10-heritage-assets':   'Heritage Assets',
    '10-ecological-receptors': 'Ecological Receptors',
    '13-ecological-receptors': 'Ecological Receptors',
    '11-geology-soils':     'Geology & Soil Types',
    '12-flood-potential':   'Flooding Potential',
    '14-water-courses':     'Water Courses',
    '15-mining-records':    'Mining Records',
    '16-contaminated-land': 'Contaminated Land',
    '17-pollution-regulatory': 'Pollution & Regulatory',
    '13-data-quality':      'Data Quality',
    '20-data-quality':      'Data Quality',
  };
  for (const [key, label] of Object.entries(map)) {
    if (file.includes(key)) return label;
  }
  return '';
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

async function encodeImageAsBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await readFile(imagePath);
    const base64      = imageBuffer.toString('base64');
    const ext         = imagePath.split('.').pop()?.toLowerCase();
    const mimeType    = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch {
    console.warn(`⚠️ Could not load image: ${imagePath}`);
    return '';
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function stripMarkdownJsonFence(content: string): string {
  let s = String(content).trim();
  s = s.replace(/^```(?:json)?\s*\n?/i, '');
  s = s.replace(/\n?```\s*$/i, '');
  s = s.trim();
  const first = s.indexOf('{');
  const last  = s.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
  return s;
}

export function getAiSummary(data: any): any {
  if (!data?.content) return {};
  try {
    return JSON.parse(stripMarkdownJsonFence(data.content));
  } catch {
    return {};
  }
}

export function broadbandSignal(signal: number): string {
  const signalCoverage: Array<string> = [
    ` <path d="M12 20h.01"></path>`,
    ` <path d="M12 20h.01"></path>
      <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>`,
    ` <path d="M12 20h.01"></path>
      <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>
      <path d="M5 13a10 10 0 0 1 14 0"></path>`,
    ` <path d="M12 20h.01"></path>
      <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>
      <path d="M5 13a10 10 0 0 1 14 0"></path>
      <path d="M2 8.5a15 15 0 0 1 20 0"></path>`,
  ];
  return signalCoverage[signal];
}

export function clearTemplateCache() {
  templateCache.clear();
  cssCache = null;
  imageCache.clear();
  console.log('🗑️ Template cache cleared');
}

export async function warmupCache() {
  console.log('🔥 Warming up template cache...');
  const allFiles = [
    ...STARTER_SECTIONS.map((s) => join(TEMPLATES_DIR, 'starter', s.file)),
    ...PREMIUM_SECTIONS.map((s) => join(TEMPLATES_DIR, 'premium', s.file)),
    join(TEMPLATES_DIR, 'styles.css'),
  ];
  return Promise.allSettled(allFiles.map((f) => readFile(f, 'utf-8')));
}