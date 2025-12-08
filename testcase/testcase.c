typedef signed char int8_t;
typedef short int16_t;
typedef int int32_t;
typedef long long int64_t;

typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;
typedef unsigned long long uint64_t;


typedef int8_t int_least8_t;
typedef int16_t int_least16_t;
typedef int32_t int_least32_t;
typedef int64_t int_least64_t;
typedef uint8_t uint_least8_t;
typedef uint16_t uint_least16_t;
typedef uint32_t uint_least32_t;
typedef uint64_t uint_least64_t;



typedef int8_t int_fast8_t;
typedef int16_t int_fast16_t;
typedef int32_t int_fast32_t;
typedef int64_t int_fast64_t;
typedef uint8_t uint_fast8_t;
typedef uint16_t uint_fast16_t;
typedef uint32_t uint_fast32_t;
typedef uint64_t uint_fast64_t;




typedef signed char __int8_t;



typedef unsigned char __uint8_t;
typedef short __int16_t;
typedef unsigned short __uint16_t;
typedef int __int32_t;
typedef unsigned int __uint32_t;
typedef long long __int64_t;
typedef unsigned long long __uint64_t;

typedef long __darwin_intptr_t;
typedef unsigned int __darwin_natural_t;
typedef int __darwin_ct_rune_t;





typedef union {
 char __mbstate8[128];
 long long _mbstateL;
} __mbstate_t;

typedef __mbstate_t __darwin_mbstate_t;




typedef long int __darwin_ptrdiff_t;
typedef long unsigned int __darwin_size_t;







typedef __builtin_va_list __darwin_va_list;







typedef int __darwin_wchar_t;




typedef __darwin_wchar_t __darwin_rune_t;


typedef int __darwin_wint_t;




typedef unsigned long __darwin_clock_t;
typedef __uint32_t __darwin_socklen_t;
typedef long __darwin_ssize_t;
typedef long __darwin_time_t;
typedef __int64_t __darwin_blkcnt_t;
typedef __int32_t __darwin_blksize_t;
typedef __int32_t __darwin_dev_t;
typedef unsigned int __darwin_fsblkcnt_t;
typedef unsigned int __darwin_fsfilcnt_t;
typedef __uint32_t __darwin_gid_t;
typedef __uint32_t __darwin_id_t;
typedef __uint64_t __darwin_ino64_t;

typedef __darwin_ino64_t __darwin_ino_t;



typedef __darwin_natural_t __darwin_mach_port_name_t;
typedef __darwin_mach_port_name_t __darwin_mach_port_t;
typedef __uint16_t __darwin_mode_t;
typedef __int64_t __darwin_off_t;
typedef __int32_t __darwin_pid_t;
typedef __uint32_t __darwin_sigset_t;
typedef __int32_t __darwin_suseconds_t;
typedef __uint32_t __darwin_uid_t;
typedef __uint32_t __darwin_useconds_t;
typedef unsigned char __darwin_uuid_t[16];
typedef char __darwin_uuid_string_t[37];



struct __darwin_pthread_handler_rec {
 void (*__routine)(void *);
 void *__arg;
 struct __darwin_pthread_handler_rec *__next;
};

struct _opaque_pthread_attr_t {
 long __sig;
 char __opaque[56];
};

struct _opaque_pthread_cond_t {
 long __sig;
 char __opaque[40];
};

struct _opaque_pthread_condattr_t {
 long __sig;
 char __opaque[8];
};

struct _opaque_pthread_mutex_t {
 long __sig;
 char __opaque[56];
};

struct _opaque_pthread_mutexattr_t {
 long __sig;
 char __opaque[8];
};

struct _opaque_pthread_once_t {
 long __sig;
 char __opaque[8];
};

struct _opaque_pthread_rwlock_t {
 long __sig;
 char __opaque[192];
};

struct _opaque_pthread_rwlockattr_t {
 long __sig;
 char __opaque[16];
};

struct _opaque_pthread_t {
 long __sig;
 struct __darwin_pthread_handler_rec *__cleanup_stack;
 char __opaque[8176];
};

typedef struct _opaque_pthread_attr_t __darwin_pthread_attr_t;
typedef struct _opaque_pthread_cond_t __darwin_pthread_cond_t;
typedef struct _opaque_pthread_condattr_t __darwin_pthread_condattr_t;
typedef unsigned long __darwin_pthread_key_t;
typedef struct _opaque_pthread_mutex_t __darwin_pthread_mutex_t;
typedef struct _opaque_pthread_mutexattr_t __darwin_pthread_mutexattr_t;
typedef struct _opaque_pthread_once_t __darwin_pthread_once_t;
typedef struct _opaque_pthread_rwlock_t __darwin_pthread_rwlock_t;
typedef struct _opaque_pthread_rwlockattr_t __darwin_pthread_rwlockattr_t;
typedef struct _opaque_pthread_t *__darwin_pthread_t;
typedef __darwin_intptr_t intptr_t;
typedef unsigned long uintptr_t;



typedef long int intmax_t;
typedef long unsigned int uintmax_t;
typedef int __darwin_nl_item;
typedef int __darwin_wctrans_t;

typedef __uint32_t __darwin_wctype_t;

typedef __darwin_size_t size_t;






void *
  memchr(const void * __s, int __c, size_t __n);
int memcmp(const void * __s1, const void * __s2,
  size_t __n);
void *
  memcpy(void * __dst, const void * __src,
  size_t __n);
void *
  memmove(void * __dst,
  const void * __src, size_t __len);
void *
  memset(void * __b, int __c, size_t __len);
char *
  strcat(char * __s1, const char *__s2)
                                  ;
char * strchr(const char *__s, int __c);
int strcmp(const char *__s1, const char *__s2);
int strcoll(const char *__s1, const char *__s2);
char *
  strcpy(char * __dst, const char *__src)
                                  ;
size_t strcspn(const char *__s, const char *__charset);
char * strerror(int __errnum) __asm("_" "strerror" );
size_t strlen(const char *__s);
char *
  strncat(char * __s1,
  const char * __s2, size_t __n)
                                  ;
int strncmp(const char * __s1,
  const char * __s2, size_t __n);
char *
  strncpy(char * __dst,
        const char * __src, size_t __n)
                                        ;
char * strpbrk(const char *__s, const char *__charset);
char * strrchr(const char *__s, int __c);
size_t strspn(const char *__s, const char *__charset);
char * strstr(const char *__big, const char *__little);
char * strtok(char * __str, const char *__sep);
size_t strxfrm(char * __s1, const char *__s2, size_t __n);
char *
        strtok_r(char * __str, const char *__sep,
        char * *__lasts);
int strerror_r(int __errnum, char * __strerrbuf,
        size_t __buflen);
char * strdup(const char *__s1);
void *
        memccpy(void * __dst, const void * __src,
        int __c, size_t __n);
char *
        stpcpy(char * __dst, const char *__src) ;
char *
        stpncpy(char * __dst,
        const char * __src, size_t __n)
        __attribute__((availability(macosx,introduced=10.7)))
                                        ;
char * strndup(const char * __s1, size_t __n) __attribute__((availability(macosx,introduced=10.7)));
size_t strnlen(const char * __s1, size_t __n) __attribute__((availability(macosx,introduced=10.7)));
char * strsignal(int __sig);






typedef unsigned char u_int8_t;
typedef unsigned short u_int16_t;
typedef unsigned int u_int32_t;
typedef unsigned long long u_int64_t;


typedef int64_t register_t;
typedef u_int64_t user_addr_t;
typedef u_int64_t user_size_t;
typedef int64_t user_ssize_t;
typedef int64_t user_long_t;
typedef u_int64_t user_ulong_t;
typedef int64_t user_time_t;
typedef int64_t user_off_t;
typedef u_int64_t syscall_arg_t;
typedef __darwin_size_t rsize_t;
typedef int errno_t;


errno_t memset_s(void * __s, rsize_t __smax, int __c, rsize_t __n) __attribute__((availability(macosx,introduced=10.9)));






typedef __darwin_ssize_t ssize_t;


void *
        memmem(const void * __big, size_t __big_len,
        const void * __little, size_t __little_len) __attribute__((availability(macosx,introduced=10.7)));
void memset_pattern4(void * __b, const void * __pattern4, size_t __len) __attribute__((availability(macosx,introduced=10.5)));
void memset_pattern8(void * __b, const void * __pattern8, size_t __len) __attribute__((availability(macosx,introduced=10.5)));
void memset_pattern16(void * __b, const void * __pattern16, size_t __len) __attribute__((availability(macosx,introduced=10.5)));

char *
        strcasestr(const char *__big, const char *__little);
__attribute__((availability(macosx,introduced=15.4))) __attribute__((availability(ios,introduced=18.4)))
__attribute__((availability(tvos,introduced=18.4))) __attribute__((availability(watchos,introduced=11.4)))
char *
        strchrnul(const char *__s, int __c);
char *
        strnstr(const char * __big, const char *__little, size_t __len);
size_t strlcat(char * __dst, const char *__source, size_t __size);
size_t strlcpy(char * __dst, const char *__source, size_t __size);
void strmode(int __mode, char * __bp);
char *
        strsep(char * *__stringp, const char *__delim);


void swab(const void * restrict, void * restrict, ssize_t __len);

__attribute__((availability(macosx,introduced=10.12.1))) __attribute__((availability(ios,introduced=10.1)))
__attribute__((availability(tvos,introduced=10.0.1))) __attribute__((availability(watchos,introduced=3.1)))
int timingsafe_bcmp(const void * __b1, const void * __b2, size_t __len);

__attribute__((availability(macosx,introduced=11.0))) __attribute__((availability(ios,introduced=14.0)))
__attribute__((availability(tvos,introduced=14.0))) __attribute__((availability(watchos,introduced=7.0)))
int strsignal_r(int __sig, char * __strsignalbuf, size_t __buflen);











int bcmp(const void *, const void *, size_t __n) ;
void bcopy(const void *, void *, size_t __n) ;
void bzero(void *, size_t __n) ;
char * index(const char *, int) ;
char * rindex(const char *, int) ;


int ffs(int);
int strcasecmp(const char *, const char *);
int strncasecmp(const char *, const char *, size_t);





int ffsl(long) __attribute__((availability(macosx,introduced=10.5)));
int ffsll(long long) __attribute__((availability(macosx,introduced=10.9)));
int fls(int) __attribute__((availability(macosx,introduced=10.5)));
int flsl(long) __attribute__((availability(macosx,introduced=10.5)));
int flsll(long long) __attribute__((availability(macosx,introduced=10.9)));











struct Record {
    int id;
    int value;
    char name[32];
};

int sum_array(const int *a, int n)
{
    int s = 0;
    for (int i = 0; i < n; i++) {
        s += a[i];
    }
    return s;
}

void scale_array(float *a, int n, float factor)
{
    for (int i = 0; i < n; i++) {
        a[i] = a[i] * factor;
    }
}

int find_max(const int *a, int n)
{
    if (n <= 0) return -1;
    int maxv = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > maxv)
            maxv = a[i];
    }
    return maxv;
}

void reverse_chars(char *s)
{
    int n = strlen(s);
    for (int i = 0; i < n/2; i++) {
        char tmp = s[i];
        s[i] = s[n - 1 - i];
        s[n - 1 - i] = tmp;
    }
}

void update_records(struct Record *rec, int count)
{
    for (int i = 0; i < count; i++) {
        rec[i].value += rec[i].id * 3;

        if (rec[i].value % 2 == 0) {
            __builtin___strcat_chk (rec[i].name, "_EVEN", __builtin_object_size (rec[i].name, 2 > 1 ? 1 : 0));
        } else {
            __builtin___strcat_chk (rec[i].name, "_ODD", __builtin_object_size (rec[i].name, 2 > 1 ? 1 : 0));
        }
    }
}

int count_matches(const char *s, char c)
{
    int cnt = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == c)
            cnt++;
    }
    return cnt;
}

int compute_checksum(const uint8_t *b, int n)
{
    uint32_t sum = 0;
    for (int i = 0; i < n; i++) {
        sum += b[i];
        sum = (sum & 0xFFFF) + (sum >> 16);
    }
    return sum & 0xFFFF;
}

void matrix_add(int m, int n, const int *A, const int *B, int *C)
{
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            int idx = i * n + j;
            C[idx] = A[idx] + B[idx];
        }
    }
}

void bubble_sort(int *a, int n)
{
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j];
                a[j] = a[j+1];
                a[j+1] = t;
            }
        }
    }
}

int fibonacci(int n)
{
    if (n <= 1) return n;
    int f0 = 0, f1 = 1;
    for (int i = 2; i <= n; i++) {
        int f2 = f0 + f1;
        f0 = f1;
        f1 = f2;
    }
    return f1;
}

int main(void)
{
    int arr[16];
    for (int i = 0; i < 16; i++)
        arr[i] = (i * 7) % 13;

    int s = sum_array(arr, 16);

    float farr[10];
    for (int i = 0; i < 10; i++)
        farr[i] = i * 1.25f;

    scale_array(farr, 10, 0.75f);

    int maxv = find_max(arr, 16);

    char str[64] = "hello_world_test_case";
    reverse_chars(str);

    struct Record rec[3] = {
        {1, 10, "first"},
        {2, 5, "second"},
        {3, 7, "third"}
    };
    update_records(rec, 3);

    int cm = count_matches("banana_bandana", 'a');

    uint8_t bytes[32];
    for (int i = 0; i < 32; i++)
        bytes[i] = i * 3;

    int chksum = compute_checksum(bytes, 32);

    int A[9], B[9], C[9];
    for (int i = 0; i < 9; i++) {
        A[i] = i;
        B[i] = i * 2;
    }
    matrix_add(3, 3, A, B, C);

    int sortarr[8] = {9, 2, 5, 1, 7, 3, 6, 4};
    bubble_sort(sortarr, 8);

    int fib = fibonacci(15);

    return 0;
}
