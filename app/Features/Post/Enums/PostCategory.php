<?php

namespace App\Features\Post\Enums;

enum PostCategory: string
{
    case Teknologi = 'Teknologi';
    case Pendidikan = 'Pendidikan';
    case GayaHidup = 'Gaya Hidup';
    case Bisnis = 'Bisnis';
    case Opini = 'Opini';
    case Umum = 'Umum';

    /**
     * Get the human readable label of the category.
     */
    public function label(): string
    {
        return $this->value;
    }

    /**
     * Get the Tailwind classes used to render a category badge.
     */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Teknologi => 'bg-blue-100 text-blue-800 border-blue-300',
            self::Pendidikan => 'bg-emerald-100 text-emerald-800 border-emerald-300',
            self::GayaHidup => 'bg-pink-100 text-pink-800 border-pink-300',
            self::Bisnis => 'bg-amber-100 text-amber-800 border-amber-300',
            self::Opini => 'bg-purple-100 text-purple-800 border-purple-300',
            self::Umum => 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }

    /**
     * Get all raw category values.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
