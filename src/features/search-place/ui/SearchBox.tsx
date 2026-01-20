'use client';

import { useMemo, useState } from 'react';
import { normalizeDistricts } from '@/entities/place/lib/normalizeDistricts';
import { searchPlaces } from '@/entities/place/lib/searchPlaces';
import { Place } from '@/entities/place/model/types';

export default function SearchBox() {
    const places = useMemo(() => normalizeDistricts(), []);
    const [keyword, setKeyword] = useState('');
    const [selected, setSelected] = useState<Place | null>(null);

    const results = useMemo(
        () => searchPlaces(places, keyword, 20),
        [places, keyword]
    );

    return (
        <div className="w-full max-w-xl">
            <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="예: 서울특별시, 종로구, 청운동"
                value={keyword}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setSelected(null);
                }}
            />

            {!!keyword && !selected && (
                <div className="mt-2 max-h-72 overflow-auto rounded-lg border">
                    {results.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">검색 결과가 없습니다.</div>
                    ) : (
                        results.map((p) => (
                            <button
                                key={p.id}
                                className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                                onClick={() => setSelected(p)}
                            >
                                {p.name}
                            </button>
                        ))
                    )}
                </div>
            )}

            {selected && (
                <div className="mt-2 rounded-lg border p-3 text-sm">
                    선택됨:
                    <span className="ml-1 font-medium">{selected.name}</span>
                </div>
            )}
        </div>
    );
}