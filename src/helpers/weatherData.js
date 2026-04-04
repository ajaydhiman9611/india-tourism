// Static best-time-to-visit data for Indian states
export const bestTimeToVisit = {
    "Andhra Pradesh": { months: "Oct – Mar", climate: "Tropical", tip: "Avoid summer (Apr–Jun) due to intense heat." },
    "Arunachal Pradesh": { months: "Oct – Apr", climate: "Sub-tropical/Alpine", tip: "Monsoon (Jun–Sep) causes landslides; winter is crisp and clear." },
    "Assam": { months: "Nov – Apr", climate: "Tropical monsoon", tip: "Avoid monsoon season for wildlife safaris at Kaziranga." },
    "Bihar": { months: "Oct – Mar", climate: "Sub-humid", tip: "Winters are ideal for Buddhist circuit tourism." },
    "Chhattisgarh": { months: "Oct – Mar", climate: "Tropical", tip: "Waterfalls are best seen just after monsoon (Sep–Oct)." },
    "Goa": { months: "Nov – Feb", climate: "Tropical", tip: "Peak season Dec–Jan. Monsoon (Jun–Sep) is lush but beaches close." },
    "Gujarat": { months: "Oct – Mar", climate: "Semi-arid", tip: "Rann Utsav festival (Nov–Feb) is unmissable at the Rann of Kutch." },
    "Haryana": { months: "Oct – Mar", climate: "Semi-arid", tip: "Summers are harsh; winters offer pleasant sightseeing." },
    "Himachal Pradesh": { months: "Mar – Jun, Sep – Nov", climate: "Alpine/Temperate", tip: "Snow lovers visit Dec–Feb; trekkers prefer May–Jun and Sep–Oct." },
    "Jharkhand": { months: "Oct – Mar", climate: "Tropical", tip: "Waterfalls peak after monsoon in Sep–Oct." },
    "Karnataka": { months: "Oct – Feb", climate: "Tropical/Semi-arid", tip: "Coorg is gorgeous after the monsoon (Sep). Hampi is best Oct–Mar." },
    "Kerala": { months: "Sep – Mar", climate: "Tropical monsoon", tip: "Backwater cruises are magical Oct–Feb. Southwest monsoon Jun–Aug is dramatic." },
    "Madhya Pradesh": { months: "Oct – Mar", climate: "Sub-tropical", tip: "Tiger safaris at Kanha/Bandhavgarh are best Oct–Apr." },
    "Maharashtra": { months: "Oct – Mar", climate: "Tropical/Semi-arid", tip: "Ajanta & Ellora caves are best in the cool dry months." },
    "Manipur": { months: "Oct – Mar", climate: "Sub-tropical", tip: "Avoid monsoon; the Loktak Lake festival is held in Nov." },
    "Meghalaya": { months: "Oct – May", climate: "Sub-tropical", tip: "The wettest region on earth—monsoon (Jun–Sep) is intense but scenically stunning." },
    "Mizoram": { months: "Oct – Mar", climate: "Sub-tropical", tip: "Winter months offer clear skies and easy trekking." },
    "Nagaland": { months: "Oct – Apr", climate: "Sub-tropical/Alpine", tip: "Hornbill Festival (Dec) is the highlight of the year." },
    "Odisha": { months: "Oct – Feb", climate: "Tropical", tip: "Rath Yatra (Jun–Jul) is spectacular but hot. Olive Ridley turtle nesting Nov–Jan." },
    "Punjab": { months: "Oct – Mar", climate: "Semi-arid", tip: "Baisakhi harvest festival (Apr) is vibrant; summers can be scorching." },
    "Rajasthan": { months: "Oct – Mar", climate: "Arid/Desert", tip: "Avoid May–Jun (extreme heat). Diwali and Pushkar Fair (Oct–Nov) are iconic." },
    "Sikkim": { months: "Mar – May, Oct – Dec", climate: "Alpine", tip: "Spring rhododendrons (Mar–Apr) and clear autumn skies (Oct–Nov) are prime." },
    "Tamil Nadu": { months: "Nov – Feb", climate: "Tropical", tip: "Most of TN receives northeast monsoon Oct–Dec; hilly Ooty is best Apr–Jun." },
    "Telangana": { months: "Oct – Mar", climate: "Tropical", tip: "Hyderabad has a pleasant winter. Nagarjunasagar is best Oct–Feb." },
    "Tripura": { months: "Oct – Mar", climate: "Sub-tropical", tip: "Avoid the heavy monsoon; winter festivals are vibrant." },
    "Uttar Pradesh": { months: "Oct – Mar", climate: "Sub-humid", tip: "Taj Mahal looks best in the soft winter light. Kumbh Mela (every 3 yrs) is unmissable." },
    "Uttarakhand": { months: "Apr – Jun, Sep – Nov", climate: "Alpine/Temperate", tip: "Char Dham yatra opens Apr–May. Ski season Dec–Mar in Auli." },
    "West Bengal": { months: "Oct – Mar", climate: "Tropical/Sub-tropical", tip: "Durga Puja (Oct) in Kolkata is world-famous. Darjeeling is lovely Apr–May and Sep–Nov." },
    "Andaman and Nicobar Islands": { months: "Nov – May", climate: "Tropical island", tip: "Avoid the cyclone-prone monsoon (May–Oct). Diving season Nov–Apr." },
    "Chandigarh": { months: "Oct – Mar", climate: "Semi-arid", tip: "Comfortable winters for exploring the city and gardens." },
    "Delhi": { months: "Oct – Mar", climate: "Semi-arid", tip: "Avoid Apr–Jun (extreme heat) and Dec–Jan smog. Diwali (Oct–Nov) is stunning." },
    "Jammu and Kashmir": { months: "Apr – Oct", climate: "Alpine/Temperate", tip: "Winters close many passes; Dal Lake in spring (Apr–May) is iconic." },
    "Ladakh": { months: "Jun – Sep", climate: "Cold desert/Alpine", tip: "Road access opens Jun; Hemis Festival (Jul) is the biggest highlight." },
    "Lakshadweep": { months: "Oct – May", climate: "Tropical island", tip: "Monsoon (Jun–Sep) brings rough seas. Snorkeling peaks Dec–Apr." },
    "Puducherry": { months: "Oct – Mar", climate: "Tropical", tip: "The French quarter is delightful in the cool, dry months." },
}

export const getWeatherInfo = (stateName) => {
    if (!stateName) return null
    const key = Object.keys(bestTimeToVisit).find(
        k => k.toLowerCase() === stateName.toLowerCase()
    )
    return key ? bestTimeToVisit[key] : null
}
